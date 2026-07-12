import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing local ${filename}:`, error);
  }
};

export async function GET() {
  try {
    // 1. Fetch Admin Accounts
    let admins: any[] = [];
    try {
      const { data } = await supabaseAdmin.from('admin_users').select('*');
      if (data) admins = data;
    } catch (e) {
      console.warn("DB Admin fetch failed, using fallback:", e);
    }
    if (admins.length === 0) {
      admins = readLocalJSON('admin_users.json');
    }

    // 2. Fetch Approved Volunteers
    let volunteers: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('volunteer_applications')
        .select('*')
        .eq('status', 'Approved');
      if (data) {
        volunteers = data.map((item: any) => {
          let newItem = { ...item };
          try {
            if (item.motivation && item.motivation.trim().startsWith('{')) {
              const parsed = JSON.parse(item.motivation);
              newItem.motivation = parsed.text || "";
              newItem.profile_photo = parsed.profile_photo || "";
              newItem.gender = parsed.gender || "";
            }
          } catch (e) {}
          return newItem;
        });
      }
    } catch (e) {
      console.warn("DB Volunteer fetch failed, using fallback:", e);
    }
    if (volunteers.length === 0) {
      volunteers = readLocalJSON('volunteer_applications.json').filter(v => v.status === "Approved");
    }

    // 3. Fetch Regular Users
    let users: any[] = [];
    try {
      const { data } = await supabaseAdmin.from('users').select('*');
      if (data) users = data;
    } catch (e) {
      console.warn("DB User fetch failed, using fallback:", e);
    }
    if (users.length === 0) {
      users = readLocalJSON('users.json');
    }

    // Combine by unique email ID
    const registryMap = new Map<string, any>();

    // Load regular users
    users.forEach(u => {
      if (u.email) {
        const email = u.email.trim().toLowerCase();
        registryMap.set(email, {
          id: `user-${u.id}`,
          name: u.username || u.name || "User",
          email: u.email,
          phone: u.phone || "",
          role: "user",
          password: u.password || ""
        });
      }
    });

    // Load volunteers
    volunteers.forEach(v => {
      if (v.email) {
        const email = v.email.trim().toLowerCase();
        registryMap.set(email, {
          id: `volunteer-${v.id}`,
          name: v.name || "Volunteer",
          email: v.email,
          phone: v.phone || "",
          role: "volunteer",
          password: ""
        });
      }
    });

    // Load admins
    admins.forEach(a => {
      if (a.email) {
        const email = a.email.trim().toLowerCase();
        registryMap.set(email, {
          id: `admin-${a.id || a.username}`,
          name: a.username || "Admin",
          email: a.email,
          phone: a.phone || "",
          role: "admin",
          password: a.password || ""
        });
      }
    });

    const allUsers = Array.from(registryMap.values());

    return NextResponse.json({ success: true, users: allUsers });
  } catch (error: any) {
    console.error("Unified users list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, phone, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: "Username, email, and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if email already exists in Supabase
    let dbSuccess = false;
    let newUser = null;

    try {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ success: false, error: "User with this email already exists." }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          username,
          email: cleanEmail,
          phone: phone || "",
          password
        }])
        .select()
        .single();

      if (!error && data) {
        dbSuccess = true;
        newUser = data;
      } else if (error) {
        console.warn("Supabase user insert failed:", error);
      }
    } catch (e) {
      console.warn("DB user insert exception:", e);
    }

    // 2. Local Fallback Sync
    const localUsers = readLocalJSON('users.json');
    if (localUsers.some((u: any) => u.email?.trim().toLowerCase() === cleanEmail)) {
      return NextResponse.json({ success: false, error: "User with this email already exists." }, { status: 400 });
    }

    if (!dbSuccess) {
      const id = Date.now();
      newUser = {
        id,
        username,
        email: cleanEmail,
        phone: phone || "",
        password,
        created_at: new Date().toISOString()
      };
    }

    localUsers.push({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password
    });
    writeLocalJSON('users.json', localUsers);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, username, email, phone, password } = body;

    if (!id || !username || !email || !password) {
      return NextResponse.json({ success: false, error: "ID, username, email, and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = String(id).replace("user-", "");

    // 1. Supabase Update
    let dbSuccess = false;
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          username,
          email: cleanEmail,
          phone: phone || "",
          password
        })
        .eq('id', cleanId);

      if (!error) {
        dbSuccess = true;
      } else {
        console.warn("Supabase user update failed:", error);
      }
    } catch (e) {
      console.warn("DB user update exception:", e);
    }

    // 2. Local Fallback Sync
    let localUsers = readLocalJSON('users.json');
    let found = false;

    localUsers = localUsers.map((u: any) => {
      if (String(u.id) === cleanId || u.email?.trim().toLowerCase() === cleanEmail) {
        found = true;
        return {
          ...u,
          username,
          email: cleanEmail,
          phone: phone || "",
          password
        };
      }
      return u;
    });

    if (found || !dbSuccess) {
      writeLocalJSON('users.json', localUsers);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    const cleanId = String(id).replace("user-", "");

    // 1. Supabase Delete
    let dbSuccess = false;
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', cleanId);

      if (!error) {
        dbSuccess = true;
      } else {
        console.warn("Supabase user delete failed:", error);
      }
    } catch (e) {
      console.warn("DB user delete exception:", e);
    }

    // 2. Local Fallback Sync
    let localUsers = readLocalJSON('users.json');
    const originalLength = localUsers.length;
    localUsers = localUsers.filter((u: any) => String(u.id) !== cleanId);

    if (localUsers.length < originalLength || !dbSuccess) {
      writeLocalJSON('users.json', localUsers);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
