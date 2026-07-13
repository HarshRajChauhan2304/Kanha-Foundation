import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { syncVolunteerToHighlights } from '@/lib/db-fallback';

// Helper to read local JSON files
const readLocalJSON = (filename: string): any[] => {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error reading local ${filename}:`, error);
  }
  return [];
};

// Helper to write local JSON files
const writeLocalJSON = (filename: string, data: any[]) => {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing local ${filename}:`, error);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newRole } = body;

    if (!email || !newRole) {
      return NextResponse.json({ success: false, error: "Please provide email and newRole." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const validRoles = ["user", "volunteer", "admin"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ success: false, error: "Invalid role specified." }, { status: 400 });
    }

    // ==========================================
    // 1. Locate the existing user data anywhere
    // ==========================================
    let existingUser: any = null;

    // A. Check admin_users
    try {
      const { data } = await supabaseAdmin.from('admin_users').select('*').eq('email', cleanEmail).single();
      if (data) existingUser = { name: data.username, phone: data.phone || "", password: data.password || "admin123", currentRole: "admin" };
    } catch (e) {}

    // B. Check volunteer_applications
    if (!existingUser) {
      try {
        const { data } = await supabaseAdmin.from('volunteer_applications').select('*').eq('email', cleanEmail).single();
        if (data) {
          let deserialized = { ...data };
          try {
            if (data.motivation && data.motivation.trim().startsWith('{')) {
              const parsed = JSON.parse(data.motivation);
              deserialized.motivation = parsed.text || "";
              deserialized.profile_photo = parsed.profile_photo || "";
              deserialized.gender = parsed.gender || "";
            }
          } catch (e) {}
          existingUser = { name: deserialized.name, phone: deserialized.phone || "", password: deserialized.password || "volunteer123", currentRole: "volunteer" };
        }
      } catch (e) {}
    }

    // C. Check users
    if (!existingUser) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
        if (data) existingUser = { name: data.username || data.name, phone: data.phone || "", password: data.password || "user123", currentRole: "user" };
      } catch (e) {}
    }

    // D. If not found in DB, check fallback JSON files
    if (!existingUser) {
      const admins = readLocalJSON('admin_users.json');
      const foundAdmin = admins.find(a => a.email?.trim().toLowerCase() === cleanEmail);
      if (foundAdmin) {
        existingUser = { name: foundAdmin.username, phone: foundAdmin.phone || "", password: foundAdmin.password || "admin123", currentRole: "admin" };
      }
    }

    if (!existingUser) {
      const volunteers = readLocalJSON('volunteer_applications.json');
      const foundVol = volunteers.find(v => v.email?.trim().toLowerCase() === cleanEmail);
      if (foundVol) {
        existingUser = { name: foundVol.name, phone: foundVol.phone || "", password: foundVol.password || "volunteer123", currentRole: "volunteer" };
      }
    }

    if (!existingUser) {
      const users = readLocalJSON('users.json');
      const foundUser = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);
      if (foundUser) {
        existingUser = { name: foundUser.username || foundUser.name, phone: foundUser.phone || "", password: foundUser.password || "user123", currentRole: "user" };
      }
    }

    // If still not found anywhere, create default credentials
    if (!existingUser) {
      existingUser = {
        name: email.split('@')[0],
        phone: "",
        password: "kanha123",
        currentRole: "unknown"
      };
    }

    const { name, phone, password } = existingUser;

    // ==========================================
    // 2. Perform Migration to target role
    // ==========================================

    // A. Delete from all tables to clear duplicates
    try {
      await supabaseAdmin.from('admin_users').delete().eq('email', cleanEmail);
      await supabaseAdmin.from('volunteer_applications').delete().eq('email', cleanEmail);
      await supabase.from('users').delete().eq('email', cleanEmail);
    } catch (e) {
      console.warn("DB deletes failed/bypassed:", e);
    }

    // Delete from JSON files
    const localAdmins = readLocalJSON('admin_users.json').filter(a => a.email?.trim().toLowerCase() !== cleanEmail);
    const localVols = readLocalJSON('volunteer_applications.json').filter(v => v.email?.trim().toLowerCase() !== cleanEmail);
    const localUsers = readLocalJSON('users.json').filter(u => u.email?.trim().toLowerCase() !== cleanEmail);

    // B. Insert into the target table
    if (newRole === "admin") {
      const payload = { username: name, email: cleanEmail, phone, password };
      try {
        await supabaseAdmin.from('admin_users').insert([payload]);
      } catch (e) {
        console.warn("DB Admin insert failed/bypassed:", e);
      }
      localAdmins.push({ id: Date.now(), ...payload });
    } else if (newRole === "volunteer") {
      const payload = {
        name,
        email: cleanEmail,
        phone,
        city: "Ranchi",
        motivation: "Role updated to Volunteer by Admin",
        skills: ["Food Distribution & Relief Work"],
        status: "Approved",
        password
      };
      try {
        await supabaseAdmin.from('volunteer_applications').insert([payload]);
      } catch (e) {
        console.warn("DB Volunteer insert failed/bypassed:", e);
      }
      localVols.push({ id: Date.now(), ...payload });

      // Sync promoted volunteer to about highlights page
      try {
        await syncVolunteerToHighlights({
          name: payload.name,
          motivation: payload.motivation,
          profile_photo: "",
          gender: ""
        });
      } catch (e) {
        console.warn("Sync to highlights failed in promote route:", e);
      }
    } else if (newRole === "user") {
      const payload = { username: name, email: cleanEmail, phone, password };
      try {
        await supabase.from('users').insert([payload]);
      } catch (e) {
        console.warn("DB User insert failed/bypassed:", e);
      }
      localUsers.push({ id: Date.now(), ...payload });
    }

    // Write back updated local JSON databases
    writeLocalJSON('admin_users.json', localAdmins);
    writeLocalJSON('volunteer_applications.json', localVols);
    writeLocalJSON('users.json', localUsers);

    return NextResponse.json({ success: true, message: `Role for ${cleanEmail} updated to ${newRole} successfully!` });
  } catch (error: any) {
    console.error("Promote role update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 550 });
  }
}
