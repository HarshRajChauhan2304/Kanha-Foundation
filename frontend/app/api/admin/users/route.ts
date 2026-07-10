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
      const { data } = await supabase.from('users').select('*');
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
          role: "user"
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
          role: "volunteer"
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
          role: "admin"
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
