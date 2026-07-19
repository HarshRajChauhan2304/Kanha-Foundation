import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut, syncVolunteerToHighlights, getFallbackPath } from '@/lib/db-fallback';

// GET all volunteer registrations (for admin review)
export async function GET() {
  let applications: any[] = [];
  let useFallback = false;

  // Load local JSON fallback data to merge or fallback to
  let localApps: any[] = [];
  try {
    const fallbackPath = getFallbackPath('volunteer_applications.json');
    if (fs.existsSync(fallbackPath)) {
      localApps = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read local fallback in GET:", e);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      applications = data.map((item: any) => {
        let newItem = { ...item };
        try {
          if (item.motivation && item.motivation.trim().startsWith('{')) {
            const parsed = JSON.parse(item.motivation);
            newItem.motivation = parsed.text || "";
            newItem.profile_photo = parsed.profile_photo || item.profile_photo || "";
            newItem.gender = parsed.gender || item.gender || "";
          }
        } catch (e) {}

        // Merge from local fallback if available to ensure schema additions like certificate exist
        const localMatch = localApps.find((la: any) => String(la.id) === String(item.id));
        if (localMatch) {
          newItem = { ...newItem, ...localMatch };
        }
        return newItem;
      });
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    applications = localApps;
    if (applications.length === 0) {
      // Create seed fallback if empty
      try {
        const fallbackPath = getFallbackPath('volunteer_applications.json');
        applications = [
          {
            id: 1,
            name: "Rajesh Kumar",
            email: "volunteer@example.com",
            phone: "+917488164529",
            city: "Ranchi",
            motivation: "I want to help children with their studies and serve the local slum kids.",
            skills: ["Teaching", "Event Management"],
            status: "Pending",
            password: "volunteer123"
          }
        ];
        fs.writeFileSync(fallbackPath, JSON.stringify(applications, null, 2), 'utf-8');
      } catch (e) {
        console.error("Failed to write initial fallback JSON:", e);
      }
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  applications = applications.map((newItem: any) => {
    // Auto-generate certificate if completion date is reached and not already created
    if (newItem.status === 'Approved' && (!newItem.certificate_url || newItem.certificate_url === '') && newItem.internship_end_date) {
      if (todayStr >= newItem.internship_end_date) {
        newItem.certificate_url = 'auto';
        newItem.certificate_issue_date = newItem.internship_end_date;

        // Asynchronously update database and local file fallbacks
        (async () => {
          try {
            // Update local JSON fallback file
            const fallbackPath = getFallbackPath('volunteer_applications.json');
            if (fs.existsSync(fallbackPath)) {
              const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
              const currentData = JSON.parse(fileContent);
              if (Array.isArray(currentData)) {
                const idx = currentData.findIndex((item: any) => String(item.id) === String(newItem.id));
                if (idx !== -1) {
                  currentData[idx].certificate_url = 'auto';
                  currentData[idx].certificate_issue_date = newItem.internship_end_date;
                  fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2), 'utf-8');
                }
              }
            }
          } catch (e) {
            console.error("Auto-issue local JSON update failed:", e);
          }

          try {
            // Update Supabase DB
            await supabaseAdmin
              .from('volunteer_applications')
              .update({
                certificate_url: 'auto',
                certificate_issue_date: newItem.internship_end_date
              })
              .eq('id', newItem.id);
          } catch (dbErr) {
            console.warn("Auto-issue Supabase update failed:", dbErr);
          }
        })();
      }
    }
    return newItem;
  });

  return NextResponse.json(applications);
}

// POST a new volunteer application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, motivation, skills, password, profile_photo, gender, terms_accepted, aadhar_number, aadhar_upload_url, internship_duration, certificate_url, certificate_issue_date, internship_start_date, internship_end_date, certificate_text, certificate_signature_name, certificate_signature_title, certificate_seal_text, certificate_signature_image_url, certificate_seal_image_url } = body;

    if (!name || !email || !phone || !city || !skills || skills.length === 0) {
      return NextResponse.json({ success: false, error: "Please fill all required profile fields." }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'volunteer_applications',
      fallbackFile: 'volunteer_applications.json',
      bodyData: {
        name,
        email,
        phone,
        city,
        motivation: motivation || "",
        skills,
        status: "Pending",
        password: password || "volunteer123",
        profile_photo: profile_photo || "",
        gender: gender || "",
        terms_accepted: !!terms_accepted,
        aadhar_number: aadhar_number || "",
        aadhar_upload_url: aadhar_upload_url || "",
        internship_duration: internship_duration || "1 Month",
        certificate_url: certificate_url || "",
        certificate_issue_date: certificate_issue_date || "",
        internship_start_date: internship_start_date || "",
        internship_end_date: internship_end_date || "",
        certificate_text: certificate_text || "",
        certificate_signature_name: certificate_signature_name || "",
        certificate_signature_title: certificate_signature_title || "",
        certificate_seal_text: certificate_seal_text || "",
        certificate_signature_image_url: certificate_signature_image_url || "",
        certificate_seal_image_url: certificate_seal_image_url || ""
      }
    });

    if (result.success && result.item) {
      return NextResponse.json({ success: true, application: result.item });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) an existing volunteer application
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, city, motivation, skills, status, profile_photo, gender, terms_accepted, aadhar_number, aadhar_upload_url, internship_duration, certificate_url, certificate_issue_date, internship_start_date, internship_end_date, certificate_text, certificate_signature_name, certificate_signature_title, certificate_seal_text, certificate_signature_image_url, certificate_seal_image_url } = body;

    if (!id || !name || !email || !phone || !city) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'volunteer_applications',
      idOrKey: id,
      fallbackFile: 'volunteer_applications.json',
      bodyData: {
        name,
        email,
        phone,
        city,
        motivation: motivation || "",
        skills: skills || [],
        status: status || "Pending",
        profile_photo: profile_photo || "",
        gender: gender || "",
        terms_accepted: terms_accepted === undefined ? true : !!terms_accepted,
        aadhar_number: aadhar_number || "",
        aadhar_upload_url: aadhar_upload_url || "",
        internship_duration: internship_duration || "1 Month",
        certificate_url: certificate_url || "",
        certificate_issue_date: certificate_issue_date || "",
        internship_start_date: internship_start_date || "",
        internship_end_date: internship_end_date || "",
        certificate_text: certificate_text || "",
        certificate_signature_name: certificate_signature_name || "",
        certificate_signature_title: certificate_signature_title || "",
        certificate_seal_text: certificate_seal_text || "",
        certificate_signature_image_url: certificate_signature_image_url || "",
        certificate_seal_image_url: certificate_seal_image_url || ""
      }
    });

    if (result.success && result.item) {
      if (result.item.status === 'Approved') {
        try {
          await syncVolunteerToHighlights({
            name: result.item.name,
            motivation: result.item.motivation,
            profile_photo: result.item.profile_photo,
            gender: result.item.gender
          });
        } catch (e) {
          console.warn("Sync to highlights failed in volunteer update route:", e);
        }
      }
      return NextResponse.json({ success: true, application: result.item });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a volunteer application (for admin archive)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'volunteer_applications',
      idOrKey: id,
      fallbackFile: 'volunteer_applications.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
