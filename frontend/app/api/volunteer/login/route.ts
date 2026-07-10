import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    if (!email || !phone || !password) {
      return NextResponse.json({ success: false, error: "Please provide email, phone, and password." }, { status: 400 });
    }

    // Clean phone input to match digits-only or exact match
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    // Search volunteer_applications for matches
    const { data: rawApps, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!rawApps || rawApps.length === 0) {
      return NextResponse.json({ success: false, error: "No profile found with this email." }, { status: 404 });
    }

    const apps = rawApps.map((item: any) => {
      let newItem = { ...item };
      try {
        if (item.motivation && item.motivation.trim().startsWith('{')) {
          const parsed = JSON.parse(item.motivation);
          newItem.motivation = parsed.text || "";
          newItem.profile_photo = parsed.profile_photo || item.profile_photo || "";
          newItem.gender = parsed.gender || item.gender || "";
        }
      } catch (e) {}
      return newItem;
    });

    // Validate phone and password
    const match = apps.find(app => {
      const appCleanPhone = app.phone.replace(/[^0-9+]/g, "");
      const phoneMatches = appCleanPhone.endsWith(cleanPhone) || cleanPhone.endsWith(appCleanPhone);
      const passwordMatches = !app.password || app.password === password;
      return phoneMatches && passwordMatches;
    });

    if (!match) {
      return NextResponse.json({ success: false, error: "Email, phone number, or password details do not match." }, { status: 401 });
    }

    if (match.status !== "Approved") {
      return NextResponse.json({ 
        success: false, 
        error: `Your registration is currently '${match.status || 'Pending'}'. You can only access your profile once the admin approves your application.` 
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, volunteer: match });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
