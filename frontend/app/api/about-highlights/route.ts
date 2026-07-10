import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all directors and volunteers highlights
export async function GET() {
  let directors: any[] = [];
  let volunteers: any[] = [];
  let useFallback = false;

  try {
    const { data: dbDirs, error: dirError } = await supabase
      .from('directors')
      .select('*')
      .order('id', { ascending: true });

    const { data: dbVols, error: volError } = await supabase
      .from('volunteers')
      .select('*')
      .order('id', { ascending: true });

    if (dirError || volError || !dbDirs || !dbVols || dbDirs.length === 0 || dbVols.length === 0) {
      useFallback = true;
    } else {
      directors = dbDirs;
      volunteers = dbVols;
    }
  } catch (err) {
    useFallback = true;
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

  return NextResponse.json({
    directors,
    volunteers
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
