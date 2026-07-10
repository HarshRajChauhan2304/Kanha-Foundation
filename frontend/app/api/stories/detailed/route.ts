import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all detailed stories
export async function GET() {
  let detailedStories: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('detailed_stories')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      detailedStories = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'detailed_stories.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        detailedStories = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read detailed stories fallback JSON:", e);
    }
  }

  return NextResponse.json(detailedStories);
}

// POST new detailed story
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await resilientPost({
      table: 'detailed_stories',
      fallbackFile: 'detailed_stories.json',
      bodyData: {
        title: body.title || "New Story of Hope",
        category: body.category || "Food Relief",
        desc: body.desc || "",
        image: body.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
        stats: body.stats || "",
        date: body.date || "July 2026"
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) detailed story
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPut({
      table: 'detailed_stories',
      idOrKey: body.id,
      fallbackFile: 'detailed_stories.json',
      bodyData: {
        title: body.title,
        category: body.category,
        desc: body.desc,
        image: body.image,
        stats: storyStatsString(body), // handle compatibility
        date: body.date
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper to keep stats string
function storyStatsString(body: any) {
  return body.stats || "";
}

// DELETE detailed story
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'detailed_stories',
      idOrKey: id,
      fallbackFile: 'detailed_stories.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
