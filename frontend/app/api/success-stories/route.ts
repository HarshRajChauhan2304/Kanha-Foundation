import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all success stories
export async function GET() {
  let successStories: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      successStories = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'success_stories.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        successStories = JSON.parse(fileContent);
      } else {
        successStories = [
          {
            id: 1,
            image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
            title: "7 Lakh+ Birthday Giving",
            desc: "7 Lakh Moments of Meaningful Giving"
          },
          {
            id: 2,
            image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
            title: "Giving With Proof",
            desc: "Transparent impact you can see and trust."
          },
          {
            id: 3,
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
            title: "20 Lakh+ Lives Impacted",
            desc: "Impacting Lives. Creating Hope."
          },
          {
            id: 4,
            image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
            title: "35 Lakh+ Meals Served",
            desc: "35 Lakh Meals of Dignity"
          }
        ];
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(successStories, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read success_stories fallback JSON:", e);
    }
  }

  return NextResponse.json(successStories);
}

// POST a new success story
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, title, desc } = body;

    if (!image || !title || !desc) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'success_stories',
      fallbackFile: 'success_stories.json',
      bodyData: { image, title, desc }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) a success story
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, image, title, desc } = body;

    if (!id || !image || !title || !desc) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'success_stories',
      idOrKey: id,
      fallbackFile: 'success_stories.json',
      bodyData: { image, title, desc }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a success story
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'success_stories',
      idOrKey: id,
      fallbackFile: 'success_stories.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
