import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import { getFallbackPath } from '@/lib/db-fallback';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    if (!email || !phone || !password) {
      return NextResponse.json({ success: false, error: "Please provide email, phone, and password." }, { status: 400 });
    }

    // Clean phone input to match digits-only or exact match
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    // Load local JSON fallback data to merge
    let localApps: any[] = [];
    try {
      const fallbackPath = getFallbackPath('volunteer_applications.json');
      if (fs.existsSync(fallbackPath)) {
        localApps = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      }
    } catch (e) {
      console.warn("Failed to read local fallback in login:", e);
    }

    // Search volunteer_applications for matches
    const { data: rawApps, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    let apps: any[] = [];
    if (error || !rawApps || rawApps.length === 0) {
      // Fallback search in local database
      apps = localApps.filter((la: any) => la.email && la.email.trim().toLowerCase() === email.trim().toLowerCase());
    } else {
      apps = rawApps.map((item: any) => {
        let newItem = { ...item };
        try {
          if (item.motivation && item.motivation.trim().startsWith('{')) {
            const parsed = JSON.parse(item.motivation);
            newItem.motivation = parsed.text || "";
            newItem.profile_photo = parsed.profile_photo || item.profile_photo || "";
            newItem.gender = parsed.gender || item.gender || "";
          }
        } catch (e) {}

        // Merge from local fallback to ensure we have certificate details
        const localMatch = localApps.find((la: any) => String(la.id) === String(item.id));
        if (localMatch) {
          newItem = { ...newItem, ...localMatch };
        }
        return newItem;
      });
    }

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
