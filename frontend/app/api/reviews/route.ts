import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all reviews
export async function GET() {
  let reviews: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      reviews = data.map(item => ({
        id: item.id,
        title: item.title,
        desc: item.desc_text,
        author: item.author,
        video: item.video
      }));
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'reviews.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        reviews = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read reviews fallback JSON:", e);
    }
  }

  return NextResponse.json(reviews);
}

// POST new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await resilientPost({
      table: 'reviews',
      fallbackFile: 'reviews.json',
      bodyData: {
        title: body.title,
        desc_text: body.desc,
        author: body.author,
        video: body.video || "/DIL%20KAHTA%20HAI.mp4"
      }
    });

    if (result.success && result.item) {
      const mapped = {
        id: result.item.id,
        title: result.item.title,
        desc: result.item.desc_text || result.item.desc,
        author: result.item.author,
        video: result.item.video
      };
      return NextResponse.json({ success: true, review: mapped });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) review
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPut({
      table: 'reviews',
      idOrKey: body.id,
      fallbackFile: 'reviews.json',
      bodyData: {
        title: body.title,
        desc_text: body.desc,
        author: body.author,
        video: body.video
      }
    });

    if (result.success && result.item) {
      const mapped = {
        id: result.item.id,
        title: result.item.title,
        desc: result.item.desc_text || result.item.desc,
        author: result.item.author,
        video: result.item.video
      };
      return NextResponse.json({ success: true, review: mapped });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'reviews',
      idOrKey: id,
      fallbackFile: 'reviews.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
