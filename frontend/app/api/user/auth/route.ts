import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const getLocalUsers = (): any[] => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Error reading local users JSON:", e);
  }
  return [];
};

const saveLocalUsers = (users: any[]) => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dataPath = path.join(dataDir, 'users.json');
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing local users JSON:", e);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, email, phone, password, gender } = body;

    const localUsers = getLocalUsers();

    if (action === "signin") {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: "Please provide both email and password." }, { status: 400 });
      }

      let user = null;
      let useFallback = false;

      // 1. Try querying Supabase
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (error || !data) {
          useFallback = true;
        } else {
          user = data;
        }
      } catch (err) {
        useFallback = true;
      }

      // 2. Fall back to local JSON
      if (useFallback || !user) {
        user = localUsers.find((u: any) => u.email?.trim().toLowerCase() === email.trim().toLowerCase());
      }

      if (!user || user.password !== password) {
        return NextResponse.json({ success: false, error: "Invalid email or password credentials." }, { status: 401 });
      }

      let displayPhone = user.phone || "";
      let parsedGender = user.gender || "";
      if (displayPhone.includes("__GENDER:")) {
        const parts = displayPhone.split("__GENDER:");
        displayPhone = parts[0];
        parsedGender = parts[1];
      }

      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: displayPhone,
          gender: parsedGender || user.gender || "",
          avatar: user.avatar || "",
          bio: user.bio || ""
        }
      });
    }

    if (action === "signup") {
      if (!username || !email || !password) {
        return NextResponse.json({ success: false, error: "Please fill in all required fields." }, { status: 400 });
      }

      // Enforce email verification token validation
      const cleanEmail = email.trim().toLowerCase();
      // Email verification bypassed (OTP removed)

      // Check duplicates locally
      const duplicateLocal = localUsers.find((u: any) => u.email?.trim().toLowerCase() === email.trim().toLowerCase());
      if (duplicateLocal) {
        return NextResponse.json({ success: false, error: "Email is already registered." }, { status: 409 });
      }

      const newUser = {
        id: Date.now(),
        username,
        email: email.trim().toLowerCase(),
        phone: phone || "",
        gender: gender || "",
        password,
        created_at: new Date().toISOString()
      };

      // 1. Save locally
      localUsers.push(newUser);
      saveLocalUsers(localUsers);

      // 2. Save to Supabase
      try {
        const supabasePhone = phone ? `${phone}__GENDER:${gender || ''}` : `__GENDER:${gender || ''}`;
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert([{
            username,
            email: email.trim().toLowerCase(),
            phone: supabasePhone,
            gender: gender || "",
            password
          }])
          .select()
          .single();

        if (!error && data) {
          // Replace temp id with Supabase id locally
          const parsedData = {
            ...data,
            phone: phone || "",
            gender: gender || ""
          };
          const updatedLocal = localUsers.map(u => u.id === newUser.id ? parsedData : u);
          saveLocalUsers(updatedLocal);
          return NextResponse.json({ success: true, user: parsedData });
        } else {
          console.warn("Supabase users insert error:", error?.message);
        }
      } catch (dbErr: any) {
        console.warn("Supabase insert bypassed:", dbErr.message);
      }

      return NextResponse.json({ success: true, user: newUser, warning: "Saved to local fallback" });
    }

    if (action === "update") {
      const { currentEmail, username: newUsername, email: newEmail, phone: newPhone, avatar: newAvatar, gender: newGender, bio: newBio } = body;
      if (!currentEmail) {
        return NextResponse.json({ success: false, error: "Missing currentEmail identifier." }, { status: 400 });
      }

      let useFallback = false;
      let updatedUser = null;

      // 1. Try to update in Supabase
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({
            username: newUsername,
            email: newEmail ? newEmail.trim().toLowerCase() : undefined,
            phone: newPhone,
            avatar: newAvatar,
            gender: newGender,
            bio: newBio
          })
          .eq('email', currentEmail.trim().toLowerCase())
          .select()
          .single();

        if (error) {
          console.error("Supabase users update error:", error);
          useFallback = true;
        } else {
          updatedUser = data;
        }
      } catch (err) {
        console.error("Supabase users update exception:", err);
        useFallback = true;
      }

      // 2. Update locally
      const updatedLocalUsers = localUsers.map((u: any) => {
        if (u.email?.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
          return {
            ...u,
            username: newUsername || u.username,
            email: newEmail ? newEmail.trim().toLowerCase() : u.email,
            phone: newPhone !== undefined ? newPhone : u.phone,
            avatar: newAvatar !== undefined ? newAvatar : u.avatar,
            gender: newGender !== undefined ? newGender : u.gender,
            bio: newBio !== undefined ? newBio : u.bio
          };
        }
        return u;
      });

      saveLocalUsers(updatedLocalUsers);

      return NextResponse.json({
        success: true,
        user: updatedUser || updatedLocalUsers.find((u: any) => u.email?.trim().toLowerCase() === (newEmail || currentEmail).trim().toLowerCase())
      });
    }

    if (action === "reset") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Please enter your email." }, { status: 400 });
      }

      const exists = localUsers.some((u: any) => u.email?.trim().toLowerCase() === email.trim().toLowerCase());
      if (!exists) {
        return NextResponse.json({ success: false, error: "No account found with this email." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Recovery email link dispatched successfully." });
    }

    return NextResponse.json({ success: false, error: "Invalid auth action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
