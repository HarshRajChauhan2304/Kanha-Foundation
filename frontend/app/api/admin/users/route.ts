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
          password: v.password || ""
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
    const { username, email, phone, password, role } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Username, email, password, and role are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole = role.trim().toLowerCase();

    // 1. Delete from all tables first to avoid duplicates
    try {
      await supabaseAdmin.from('admin_users').delete().eq('email', cleanEmail);
      await supabaseAdmin.from('volunteer_applications').delete().eq('email', cleanEmail);
      await supabaseAdmin.from('users').delete().eq('email', cleanEmail);
    } catch (e) {
      console.warn("DB deletes failed/bypassed in POST:", e);
    }

    let localAdmins = readLocalJSON('admin_users.json').filter(a => a.email?.trim().toLowerCase() !== cleanEmail);
    let localVols = readLocalJSON('volunteer_applications.json').filter(v => v.email?.trim().toLowerCase() !== cleanEmail);
    let localUsers = readLocalJSON('users.json').filter(u => u.email?.trim().toLowerCase() !== cleanEmail);

    let dbSuccess = false;
    let newId: any = Date.now();

    // 2. Insert into the target role
    if (targetRole === "admin") {
      const payload = { username, email: cleanEmail, phone: phone || "", password };
      try {
        const { data, error } = await supabaseAdmin.from('admin_users').insert([payload]).select().single();
        if (!error && data) {
          dbSuccess = true;
          newId = data.id;
        }
      } catch (e) {
        console.warn("DB Admin insert failed:", e);
      }
      localAdmins.push({ id: newId, ...payload });
      writeLocalJSON('admin_users.json', localAdmins);
    } else if (targetRole === "volunteer") {
      const payload = {
        name: username,
        email: cleanEmail,
        phone: phone || "",
        city: "Ranchi",
        motivation: "Created/Approved by Admin",
        skills: ["Food Distribution & Relief Work"],
        status: "Approved",
        password
      };
      try {
        const { data, error } = await supabaseAdmin.from('volunteer_applications').insert([payload]).select().single();
        if (!error && data) {
          dbSuccess = true;
          newId = data.id;
        }
      } catch (e) {
        console.warn("DB Volunteer insert failed:", e);
      }
      localVols.push({ id: newId, ...payload });
      writeLocalJSON('volunteer_applications.json', localVols);
    } else {
      const payload = { username, email: cleanEmail, phone: phone || "", password };
      try {
        const { data, error } = await supabaseAdmin.from('users').insert([payload]).select().single();
        if (!error && data) {
          dbSuccess = true;
          newId = data.id;
        }
      } catch (e) {
        console.warn("DB User insert failed:", e);
      }
      localUsers.push({ id: newId, ...payload });
      writeLocalJSON('users.json', localUsers);
    }

    // Write back other lists to keep them clean
    writeLocalJSON('admin_users.json', localAdmins);
    writeLocalJSON('volunteer_applications.json', localVols);
    writeLocalJSON('users.json', localUsers);

    return NextResponse.json({ success: true, id: `${targetRole}-${newId}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, username, email, phone, password, role } = body;

    if (!id || !username || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "ID, username, email, password, and role are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole = role.trim().toLowerCase();

    // Determine old role and clean ID
    let oldRole = "user";
    let cleanId = String(id);
    if (String(id).startsWith("user-")) {
      oldRole = "user";
      cleanId = String(id).replace("user-", "");
    } else if (String(id).startsWith("volunteer-")) {
      oldRole = "volunteer";
      cleanId = String(id).replace("volunteer-", "");
    } else if (String(id).startsWith("admin-")) {
      oldRole = "admin";
      cleanId = String(id).replace("admin-", "");
    }

    // 1. If role changed: perform migrate (delete from old, insert into new)
    if (oldRole !== targetRole) {
      // Delete from DB
      try {
        if (oldRole === "admin") await supabaseAdmin.from('admin_users').delete().eq('id', cleanId);
        else if (oldRole === "volunteer") await supabaseAdmin.from('volunteer_applications').delete().eq('id', cleanId);
        else await supabaseAdmin.from('users').delete().eq('id', cleanId);
      } catch (e) {
        console.warn("DB delete old role failed:", e);
      }

      // Delete from JSON
      if (oldRole === "admin") {
        const local = readLocalJSON('admin_users.json').filter(a => String(a.id) !== cleanId && a.email?.trim().toLowerCase() !== cleanEmail);
        writeLocalJSON('admin_users.json', local);
      } else if (oldRole === "volunteer") {
        const local = readLocalJSON('volunteer_applications.json').filter(v => String(v.id) !== cleanId && v.email?.trim().toLowerCase() !== cleanEmail);
        writeLocalJSON('volunteer_applications.json', local);
      } else {
        const local = readLocalJSON('users.json').filter(u => String(u.id) !== cleanId && u.email?.trim().toLowerCase() !== cleanEmail);
        writeLocalJSON('users.json', local);
      }

      // Insert into new table
      let dbSuccess = false;
      let newId: any = Date.now();
      if (targetRole === "admin") {
        const payload = { username, email: cleanEmail, phone: phone || "", password };
        try {
          const { data } = await supabaseAdmin.from('admin_users').insert([payload]).select().single();
          if (data) { dbSuccess = true; newId = data.id; }
        } catch (e) {}
        const local = readLocalJSON('admin_users.json');
        local.push({ id: newId, ...payload });
        writeLocalJSON('admin_users.json', local);
      } else if (targetRole === "volunteer") {
        const payload = {
          name: username,
          email: cleanEmail,
          phone: phone || "",
          city: "Ranchi",
          motivation: "Role updated by Admin",
          skills: ["Food Distribution & Relief Work"],
          status: "Approved",
          password
        };
        try {
          const { data } = await supabaseAdmin.from('volunteer_applications').insert([payload]).select().single();
          if (data) { dbSuccess = true; newId = data.id; }
        } catch (e) {}
        const local = readLocalJSON('volunteer_applications.json');
        local.push({ id: newId, ...payload });
        writeLocalJSON('volunteer_applications.json', local);

        // Sync created volunteer to about highlights page
        try {
          await syncVolunteerToHighlights({
            name: payload.name,
            motivation: payload.motivation,
            profile_photo: "",
            gender: ""
          });
        } catch (e) {
          console.warn("Sync to highlights failed in admin users POST route:", e);
        }
      } else {
        const payload = { username, email: cleanEmail, phone: phone || "", password };
        try {
          const { data } = await supabaseAdmin.from('users').insert([payload]).select().single();
          if (data) { dbSuccess = true; newId = data.id; }
        } catch (e) {}
        const local = readLocalJSON('users.json');
        local.push({ id: newId, ...payload });
        writeLocalJSON('users.json', local);
      }
    } else {
      // 2. Same role: update corresponding record
      if (targetRole === "admin") {
        try {
          await supabaseAdmin.from('admin_users').update({ username, email: cleanEmail, phone: phone || "", password }).eq('id', cleanId);
        } catch (e) {}
        let local = readLocalJSON('admin_users.json');
        local = local.map(a => String(a.id) === cleanId ? { ...a, username, email: cleanEmail, phone: phone || "", password } : a);
        writeLocalJSON('admin_users.json', local);
      } else if (targetRole === "volunteer") {
        try {
          await supabaseAdmin.from('volunteer_applications').update({ name: username, email: cleanEmail, phone: phone || "", password }).eq('id', cleanId);
        } catch (e) {}
        let local = readLocalJSON('volunteer_applications.json');
        local = local.map(v => String(v.id) === cleanId ? { ...v, name: username, email: cleanEmail, phone: phone || "", password } : v);
        writeLocalJSON('volunteer_applications.json', local);

        // Sync updated volunteer to about highlights page
        try {
          const volData = local.find(v => String(v.id) === cleanId);
          if (volData) {
            await syncVolunteerToHighlights({
              name: volData.name,
              motivation: volData.motivation,
              profile_photo: volData.profile_photo,
              gender: volData.gender
            });
          }
        } catch (e) {
          console.warn("Sync to highlights failed in admin users PUT route:", e);
        }
      } else {
        try {
          await supabaseAdmin.from('users').update({ username, email: cleanEmail, phone: phone || "", password }).eq('id', cleanId);
        } catch (e) {}
        let local = readLocalJSON('users.json');
        local = local.map(u => String(u.id) === cleanId ? { ...u, username, email: cleanEmail, phone: phone || "", password } : u);
        writeLocalJSON('users.json', local);
      }
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

    let cleanId = String(id);
    let targetRole = "user";
    if (String(id).startsWith("user-")) {
      targetRole = "user";
      cleanId = String(id).replace("user-", "");
    } else if (String(id).startsWith("volunteer-")) {
      targetRole = "volunteer";
      cleanId = String(id).replace("volunteer-", "");
    } else if (String(id).startsWith("admin-")) {
      targetRole = "admin";
      cleanId = String(id).replace("admin-", "");
    }

    // Supabase delete
    try {
      if (targetRole === "admin") {
        await supabaseAdmin.from('admin_users').delete().eq('id', cleanId);
      } else if (targetRole === "volunteer") {
        await supabaseAdmin.from('volunteer_applications').delete().eq('id', cleanId);
      } else {
        await supabaseAdmin.from('users').delete().eq('id', cleanId);
      }
    } catch (e) {
      console.warn("DB user delete failed:", e);
    }

    // Local JSON delete
    if (targetRole === "admin") {
      const local = readLocalJSON('admin_users.json').filter(u => String(u.id) !== cleanId);
      writeLocalJSON('admin_users.json', local);
    } else if (targetRole === "volunteer") {
      const local = readLocalJSON('volunteer_applications.json').filter(u => String(u.id) !== cleanId);
      writeLocalJSON('volunteer_applications.json', local);
    } else {
      const local = readLocalJSON('users.json').filter(u => String(u.id) !== cleanId);
      writeLocalJSON('users.json', local);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
