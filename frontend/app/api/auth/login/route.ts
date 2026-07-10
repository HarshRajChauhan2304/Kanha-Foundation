import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Helper to read local JSON files
const readLocalJSON = (filename: string): any[] => {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading local ${filename}:`, error);
  }
  return [];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Please enter both email and password." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ==========================================
    // 1. Search in Admin Users
    // ==========================================
    let admin = null;
    let dbFailed = false;

    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .or(`username.eq.${cleanEmail},email.eq.${cleanEmail}`)
        .single();
      
      if (!error && data) {
        admin = data;
      }
    } catch (e) {
      dbFailed = true;
    }

    if (!admin) {
      const localAdmins = readLocalJSON('admin_users.json');
      admin = localAdmins.find((u: any) => 
        u.email?.trim().toLowerCase() === cleanEmail || u.username?.trim().toLowerCase() === cleanEmail
      );
    }

    if (admin) {
      if (admin.password === password) {
        return NextResponse.json({
          success: true,
          role: "admin",
          user: {
            username: admin.username,
            email: admin.email,
            phone: admin.phone || ""
          }
        });
      } else {
        return NextResponse.json({ success: false, error: "Invalid password for admin user." }, { status: 401 });
      }
    }

    // ==========================================
    // 2. Search in Volunteer Applications
    // ==========================================
    let volunteer = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('volunteer_applications')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && data) {
        volunteer = { ...data };
        try {
          if (data.motivation && data.motivation.trim().startsWith('{')) {
            const parsed = JSON.parse(data.motivation);
            volunteer.motivation = parsed.text || "";
            volunteer.profile_photo = parsed.profile_photo || data.profile_photo || "";
            volunteer.gender = parsed.gender || data.gender || "";
          }
        } catch (e) {}
      }
    } catch (e) {
      dbFailed = true;
    }

    if (!volunteer) {
      const localVolunteers = readLocalJSON('volunteer_applications.json');
      volunteer = localVolunteers.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail);
    }

    if (volunteer) {
      if (volunteer.password !== password) {
        return NextResponse.json({ success: false, error: "Invalid password for volunteer profile." }, { status: 401 });
      }

      if (volunteer.status !== "Approved") {
        return NextResponse.json({
          success: false,
          error: `Your registration status is currently '${volunteer.status || 'Pending'}'. You can only access your profile once approved by an administrator.`
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        role: "volunteer",
        user: {
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          city: volunteer.city || "",
          skills: volunteer.skills || [],
          status: volunteer.status
        }
      });
    }

    // ==========================================
    // 3. Search in Regular Users
    // ==========================================
    let user = null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && data) {
        user = data;
      }
    } catch (e) {
      dbFailed = true;
    }

    if (!user) {
      const localUsers = readLocalJSON('users.json');
      user = localUsers.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail);
    }

    if (user) {
      if (user.password === password) {
        let displayPhone = user.phone || "";
        let gender = user.gender || "";
        if (displayPhone.includes("__GENDER:")) {
          const parts = displayPhone.split("__GENDER:");
          displayPhone = parts[0];
          gender = parts[1];
        }

        return NextResponse.json({
          success: true,
          role: "user",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: displayPhone,
            gender: gender || user.gender || "",
            avatar: user.avatar || "",
            bio: user.bio || ""
          }
        });
      } else {
        return NextResponse.json({ success: false, error: "Invalid password." }, { status: 401 });
      }
    }

    return NextResponse.json({ success: false, error: "No account registered with this email ID." }, { status: 404 });
  } catch (error: any) {
    console.error("Unified login error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
