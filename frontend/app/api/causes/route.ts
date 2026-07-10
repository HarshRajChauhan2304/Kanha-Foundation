import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all causes
export async function GET() {
  let causes: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('causes')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      causes = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'causes.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        causes = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read causes fallback JSON:", e);
    }
  }

  return NextResponse.json(causes, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}

// POST new cause
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await resilientPost({
      table: 'causes',
      fallbackFile: 'causes.json',
      bodyData: {
        title: body.title,
        price: body.price,
        image: body.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
        video: body.video || "",
        category: body.category || "Birthday Giving"
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) existing cause
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPut({
      table: 'causes',
      idOrKey: body.id,
      fallbackFile: 'causes.json',
      bodyData: {
        title: body.title,
        price: body.price,
        image: body.image,
        video: body.video,
        category: body.category
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE cause
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID parameter missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'causes',
      idOrKey: id,
      fallbackFile: 'causes.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
