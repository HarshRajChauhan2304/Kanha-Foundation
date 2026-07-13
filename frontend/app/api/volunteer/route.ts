import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut, syncVolunteerToHighlights } from '@/lib/db-fallback';

// GET all volunteer registrations (for admin review)
export async function GET() {
  let applications: any[] = [];
  let useFallback = false;

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
        return newItem;
      });
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'volunteer_applications.json');
      if (fs.existsSync(fallbackPath)) {
        applications = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      } else {
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
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(applications, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read volunteer_applications fallback JSON:", e);
    }
  }

  return NextResponse.json(applications);
}

// POST a new volunteer application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, motivation, skills, password, profile_photo, gender, terms_accepted } = body;

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
        terms_accepted: !!terms_accepted
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
    const { id, name, email, phone, city, motivation, skills, status, profile_photo, gender, terms_accepted } = body;

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
        terms_accepted: terms_accepted === undefined ? true : !!terms_accepted
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
