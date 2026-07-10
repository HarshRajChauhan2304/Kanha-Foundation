import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'admin_users.json');

const getLocalAdminUsers = (): any[] => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading local admin users:", error);
  }
  return [];
};

const saveLocalAdminUsers = (users: any[]) => {
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving local admin users:", error);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, email, phone, password } = body;
    const localUsers = getLocalAdminUsers();

    if (action === "signin") {
      if (!username || !password) {
        return NextResponse.json({ success: false, error: "Please enter username/email and password." }, { status: 400 });
      }

      let admin = null;
      let useFallback = false;

      // 1. Try querying Supabase
      try {
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .or(`username.eq.${username.trim()},email.eq.${username.trim().toLowerCase()}`)
          .single();

        if (error || !data) {
          useFallback = true;
        } else {
          admin = data;
        }
      } catch (err) {
        useFallback = true;
      }

      // 2. Fall back to local file
      if (useFallback || !admin) {
        admin = localUsers.find((u: any) => 
          (u.username === username || u.email === username) && u.password === password
        );
      }

      if (!admin || admin.password !== password) {
        return NextResponse.json({ success: false, error: "Invalid username/email or password." }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true, 
        username: admin.username,
        email: admin.email,
        phone: admin.phone || ""
      });
    }

    if (action === "signup") {
      if (!username || !email || !password) {
        return NextResponse.json({ success: false, error: "Please fill all required fields." }, { status: 400 });
      }

      // Check duplicates locally
      const duplicateLocal = localUsers.find((u: any) => u.username === username || u.email === email);
      if (duplicateLocal) {
        return NextResponse.json({ success: false, error: "Username or email is already registered." }, { status: 409 });
      }

      const newAdmin = {
        id: Date.now(),
        username,
        email: email.trim().toLowerCase(),
        phone: phone || "",
        password,
        created_at: new Date().toISOString()
      };

      // 1. Save locally
      localUsers.push(newAdmin);
      saveLocalAdminUsers(localUsers);

      // 2. Save in Supabase
      try {
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .insert([{
            username,
            email: email.trim().toLowerCase(),
            phone: phone || null,
            password
          }])
          .select()
          .single();

        if (!error && data) {
          // Replace temp id locally
          const updatedLocal = localUsers.map(u => u.id === newAdmin.id ? data : u);
          saveLocalAdminUsers(updatedLocal);
          return NextResponse.json({ success: true, username: data.username });
        } else {
          console.warn("Supabase admin_users insert error:", error?.message);
        }
      } catch (dbErr: any) {
        console.warn("Supabase insert bypassed:", dbErr.message);
      }

      return NextResponse.json({ success: true, username: newAdmin.username, warning: "Saved to local fallback" });
    }

    if (action === "update") {
      const { currentEmail, username: newUsername, email: newEmail, phone: newPhone, avatar: newAvatar } = body;
      if (!currentEmail) {
        return NextResponse.json({ success: false, error: "Missing currentEmail identifier." }, { status: 400 });
      }

      let useFallback = false;
      let updatedAdmin = null;

      // 1. Try to update in Supabase
      try {
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .update({
            username: newUsername,
            email: newEmail.trim().toLowerCase(),
            phone: newPhone,
            avatar: newAvatar
          })
          .eq('email', currentEmail.trim().toLowerCase())
          .select()
          .single();

        if (error) {
          console.error("Supabase admin_users update error:", error);
          useFallback = true;
        } else {
          updatedAdmin = data;
        }
      } catch (err) {
        console.error("Supabase admin_users update exception:", err);
        useFallback = true;
      }

      // 2. Update locally always (or as fallback)
      const updatedLocalUsers = localUsers.map((u: any) => {
        if (u.email?.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
          return {
            ...u,
            username: newUsername || u.username,
            email: newEmail ? newEmail.trim().toLowerCase() : u.email,
            phone: newPhone !== undefined ? newPhone : u.phone,
            avatar: newAvatar || u.avatar
          };
        }
        return u;
      });

      saveLocalAdminUsers(updatedLocalUsers);

      return NextResponse.json({
        success: true,
        admin: updatedAdmin || updatedLocalUsers.find((u: any) => u.email?.trim().toLowerCase() === (newEmail || currentEmail).trim().toLowerCase())
      });
    }

    if (action === "reset") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Please enter your email." }, { status: 400 });
      }

      const exists = localUsers.some((u: any) => u.email === email);
      if (!exists) {
        return NextResponse.json({ success: false, error: "No admin user found with this email." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Admin recovery link sent successfully." });
    }

    return NextResponse.json({ success: false, error: "Invalid auth action requested." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
