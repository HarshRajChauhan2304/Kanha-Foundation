import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';


// GET all directors and volunteers highlights
export async function GET() {
  let directors: any[] = [];
  let volunteers: any[] = [];
  let useFallback = false;
  let dbApps: any[] = [];

  try {
    const { data: dbDirs, error: dirError } = await supabase
      .from('directors')
      .select('*')
      .order('id', { ascending: true });

    const { data: dbVols, error: volError } = await supabase
      .from('volunteers')
      .select('*')
      .order('id', { ascending: true });

    const { data: dbApprovedApps, error: appError } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('status', 'Approved');

    if (dirError || volError || !dbDirs || !dbVols || dbDirs.length === 0) {
      useFallback = true;
    } else {
      directors = dbDirs;
      volunteers = dbVols || [];
      dbApps = dbApprovedApps || [];
    }
  } catch (err) {
    useFallback = true;
  }

  // Load volunteer applications fallback
  let localApps: any[] = [];
  try {
    const appsFallbackPath = path.join(process.cwd(), 'data', 'volunteer_applications.json');
    if (fs.existsSync(appsFallbackPath)) {
      localApps = JSON.parse(fs.readFileSync(appsFallbackPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read volunteer applications fallback:", e);
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'about_highlights.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        directors = parsed.directors || [];
        volunteers = parsed.volunteers || [];
      }
    } catch (e) {
      console.error("Failed to read about_highlights fallback JSON:", e);
    }
  }

  // Resolve approved applications (from Supabase or local fallback)
  const approvedApps = dbApps.length > 0 ? dbApps : localApps.filter((a: any) => a.status === 'Approved');

  // Map approved applications to volunteer highlight format
  const appVolunteers = approvedApps.map((item: any) => {
    let quote = item.motivation || "Proud to be a volunteer at Kanha Foundation!";
    let profile_photo = item.profile_photo || "";
    try {
      if (item.motivation && item.motivation.trim().startsWith('{')) {
        const parsed = JSON.parse(item.motivation);
        quote = parsed.text || quote;
        profile_photo = parsed.profile_photo || profile_photo;
      }
    } catch (e) {}

    return {
      id: `app-${item.id}`,
      name: item.name,
      role: "Volunteer",
      image: profile_photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      quote: quote
    };
  });

  // Merge lists to avoid duplicates (case-insensitive check by name)
  const mergedVolunteers = [...volunteers];
  appVolunteers.forEach((appVol: any) => {
    const exists = mergedVolunteers.some(
      (v: any) => v.name && v.name.trim().toLowerCase() === appVol.name.trim().toLowerCase()
    );
    if (!exists) {
      mergedVolunteers.push(appVol);
    }
  });

  return NextResponse.json({
    directors,
    volunteers: mergedVolunteers
  });
}

// POST new highlight record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, role, image, quote } = body;

    if (type !== "directors" && type !== "volunteers") {
      return NextResponse.json({ success: false, error: "Invalid highlight type specified" }, { status: 400 });
    }

    const result = await resilientPost({
      table: type,
      fallbackFile: 'about_highlights.json',
      bodyData: { name, role, image, quote }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) existing highlight record
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, id, name, role, image, quote } = body;

    if (type !== "directors" && type !== "volunteers") {
      return NextResponse.json({ success: false, error: "Invalid highlight type specified" }, { status: 400 });
    }

    const result = await resilientPut({
      table: type,
      idOrKey: id,
      fallbackFile: 'about_highlights.json',
      bodyData: { name, role, image, quote }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE highlight record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const idStr = searchParams.get('id');

    if (!type || !idStr) {
      return NextResponse.json({ success: false, error: "Type or ID parameter missing" }, { status: 400 });
    }

    if (type !== "directors" && type !== "volunteers") {
      return NextResponse.json({ success: false, error: "Invalid type list specified" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);

    const result = await resilientDelete({
      table: type,
      idOrKey: id,
      fallbackFile: 'about_highlights.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
