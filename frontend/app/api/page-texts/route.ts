import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all static page texts configuration settings
export async function GET() {
  let texts: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('page_texts')
      .select('*')
      .order('title', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      texts = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'page_texts.json');
      if (fs.existsSync(fallbackPath)) {
        texts = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      } else {
        texts = [
          { key: "about_vision_desc", title: "About Page - Vision Description", value: "To create a just, equitable, and compassionate society where every child, animal, and needy individual gets proper care, nutrition, and education." }
        ];
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(texts, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read page_texts fallback JSON:", e);
    }
  }

  return NextResponse.json(texts);
}

// POST a new page text configuration setting
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value, title } = body;

    if (!key || !value || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'page_texts',
      fallbackFile: 'page_texts.json',
      bodyData: { key, value, title },
      idField: 'key'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) a specific page text mapping settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value, title } = body;

    if (!key || !value || !title) {
      return NextResponse.json({ success: false, error: "Key, Title and Value are required" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'page_texts',
      idOrKey: key,
      idField: 'key',
      fallbackFile: 'page_texts.json',
      bodyData: { value, title }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a specific page text configuration setting
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: "Key parameter missing" }, { status: 400 });
    }

    const result = await resilientDelete({
      table: 'page_texts',
      idOrKey: key,
      idField: 'key',
      fallbackFile: 'page_texts.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
