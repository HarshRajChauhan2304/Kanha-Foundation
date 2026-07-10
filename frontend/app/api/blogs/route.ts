import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all blogs
export async function GET() {
  let blogs: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      blogs = data.map(item => ({
        id: item.id,
        image: item.image,
        title: item.title,
        date: item.date_label,
        excerpt: item.excerpt
      }));
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'blogs.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        blogs = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read blogs fallback JSON:", e);
    }
  }

  return NextResponse.json(blogs, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}

// POST new blog
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dateLabel = body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    
    const result = await resilientPost({
      table: 'blogs',
      fallbackFile: 'blogs.json',
      bodyData: {
        image: body.image || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
        title: body.title,
        date_label: dateLabel,
        excerpt: body.excerpt
      }
    });

    if (result.success && result.item) {
      const mapped = {
        id: result.item.id,
        image: result.item.image,
        title: result.item.title,
        date: result.item.date_label,
        excerpt: result.item.excerpt
      };
      return NextResponse.json({ success: true, blog: mapped });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) blog
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPut({
      table: 'blogs',
      idOrKey: body.id,
      fallbackFile: 'blogs.json',
      bodyData: {
        title: body.title,
        image: body.image,
        date_label: body.date,
        excerpt: body.excerpt
      }
    });

    if (result.success && result.item) {
      const mapped = {
        id: result.item.id,
        image: result.item.image,
        title: result.item.title,
        date: result.item.date_label,
        excerpt: result.item.excerpt
      };
      return NextResponse.json({ success: true, blog: mapped });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE blog
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'blogs',
      idOrKey: id,
      fallbackFile: 'blogs.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
