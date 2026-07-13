import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { syncVolunteerToHighlights } from '@/lib/db-fallback';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is missing" }, { status: 400 });
    }

    // 1. Fetch the application details (try Supabase first, fallback to local JSON)
    let app: any = null;
    let fetchFromSupabase = false;

    // Check if ID is too large for Postgres integer (max 2147483647)
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    const isIdWithinIntRange = !isNaN(numericId) && numericId <= 2147483647;

    if (isIdWithinIntRange) {
      const { data, error: fetchError } = await supabaseAdmin
        .from('volunteer_applications')
        .select('*')
        .eq('id', numericId)
        .single();

      if (!fetchError && data) {
        app = data;
        fetchFromSupabase = true;
      }
    }

    // If not found in Supabase or ID is out of range, look in local JSON fallback
    if (!app) {
      try {
        const fallbackPath = path.join(process.cwd(), 'data', 'volunteer_applications.json');
        if (fs.existsSync(fallbackPath)) {
          const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
          const currentData = JSON.parse(fileContent);
          if (Array.isArray(currentData)) {
            app = currentData.find((item: any) => String(item.id) === String(id));
          }
        }
      } catch (err) {
        console.error("Failed to read local volunteer_applications for approval:", err);
      }
    }

    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found in database or local fallback." }, { status: 404 });
    }

    // 2. Update status to 'Approved'
    if (fetchFromSupabase) {
      const { error: updateError } = await supabaseAdmin
        .from('volunteer_applications')
        .update({ status: 'Approved' })
        .eq('id', numericId);

      if (updateError) {
        console.warn("Supabase update status failed, falling back to local approval:", updateError.message);
      }
    } else {
      // If the app was only local (or had a large ID), let's try inserting it into Supabase as Approved now
      try {
        const insertData = { ...app, status: 'Approved' };
        // If ID is a large fallback timestamp, strip it so Postgres generates a valid serial integer ID
        if (!isIdWithinIntRange) {
          delete insertData.id;
        }
        const { data: newDbApp, error: insertError } = await supabaseAdmin
          .from('volunteer_applications')
          .insert([insertData])
          .select()
          .single();
        
        if (!insertError && newDbApp) {
          // Update the local JSON entry with the new correct Supabase integer ID!
          app = newDbApp;
        }
      } catch (insertErr) {
        console.warn("Failed to sync approved volunteer to Supabase:", insertErr);
      }
    }

    // 2.5 Update status to 'Approved' in the local JSON fallback
    try {
      const fallbackFile = 'volunteer_applications.json';
      const fallbackPath = path.join(process.cwd(), 'data', fallbackFile);
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        const currentData = JSON.parse(fileContent);
        if (Array.isArray(currentData)) {
          const idx = currentData.findIndex((item: any) => String(item.id) === String(id));
          if (idx !== -1) {
            currentData[idx].status = 'Approved';
            // Sync the updated ID if it was synced to Supabase
            currentData[idx].id = app.id;
            fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2), 'utf-8');
          }
        }
      }
    } catch (e) {
      console.warn("Local JSON update failed in approve route:", e);
    }

    // Sync approved volunteer to about highlights page
    try {
      await syncVolunteerToHighlights({
        name: app.name,
        motivation: app.motivation,
        profile_photo: app.profile_photo,
        gender: app.gender
      });
    } catch (e) {
      console.warn("Sync to highlights failed in approve route:", e);
    }

    // 3. Simulate SMTP Email dispatching by logging to server console
    console.log(`
========================================================================
[SMTP EMAIL SIMULATOR] Dispatching Thank-You Email...
To: ${app.email}
Subject: Welcome to Kanha Foundation, ${app.name}!
Body:
  Dear ${app.name},

  We are thrilled to inform you that your volunteer application has been
  reviewed and APPROVED by our management team!

  Thank you for choosing to dedicate your time and skills (${app.skills.join(', ')})
  to make a difference in our community. Our coordinator will contact you 
  shortly to discuss onboarding steps.

  Warm regards,
  Volunteering Team
  Kanha Foundation
========================================================================
    `);

    // 4. Simulate WhatsApp notification dispatching
    console.log(`
========================================================================
[WHATSAPP SIMULATOR] Dispatching WhatsApp confirmation message...
To: ${app.phone}
Message:
  Hello ${app.name}! Thank you for registering as a volunteer with 
  Kanha Foundation. Your application has been approved. Welcome to the team!
========================================================================
    `);

    return NextResponse.json({ success: true, application: app });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
