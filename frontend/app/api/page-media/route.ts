import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

// GET all static page media settings
export async function GET() {
  let media: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('page_media')
      .select('*')
      .order('title', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      media = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'page_media.json');
      if (fs.existsSync(fallbackPath)) {
        media = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      } else {
        media = [
          { key: "home_hero_video", url: "/AAY%20HO%20MERI%20JINDI%20ME.mp4", title: "Home Page - Hero Background Video", type: "video" },
          { key: "about_header", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80", title: "About Page - Top Banner Header Image", type: "image" }
        ];
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(media, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read page_media fallback JSON:", e);
    }
  }

  return NextResponse.json(media);
}

// POST a new page media config setting
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, url, title, type } = body;

    if (!key || !url || !title || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'page_media',
      fallbackFile: 'page_media.json',
      bodyData: { key, url, title, type },
      idField: 'key'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) a specific page media mapping settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, url, title, type } = body;

    if (!key || !url || !title || !type) {
      return NextResponse.json({ success: false, error: "Key, Title, URL and Type are required" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'page_media',
      idOrKey: key,
      idField: 'key',
      fallbackFile: 'page_media.json',
      bodyData: { url, title, type }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a specific page media config setting
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: "Key parameter missing" }, { status: 400 });
    }

    const result = await resilientDelete({
      table: 'page_media',
      idOrKey: key,
      idField: 'key',
      fallbackFile: 'page_media.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
