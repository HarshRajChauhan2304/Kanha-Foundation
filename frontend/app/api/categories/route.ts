import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Birthday Giving" },
  { id: 2, name: "Anniversary Giving" },
  { id: 3, name: "Animal" },
  { id: 4, name: "Giving To The Needy" },
  { id: 5, name: "Nature" },
  { id: 6, name: "Memorial Giving" },
  { id: 7, name: "Women Care" },
  { id: 8, name: "Education" }
];

// GET all categories
export async function GET() {
  let categories: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      categories = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'categories.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        categories = JSON.parse(fileContent);
      } else {
        categories = DEFAULT_CATEGORIES;
        // Auto-create directory and file if missing
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(categories, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read categories fallback JSON:", e);
      categories = DEFAULT_CATEGORIES;
    }
  }

  return NextResponse.json(categories);
}

// POST new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'categories',
      fallbackFile: 'categories.json',
      idOrKey: null,
      bodyData: {
        name: body.name.trim()
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID parameter missing" }, { status: 400 });
    }

    const id = isNaN(Number(idStr)) ? idStr : parseInt(idStr, 10);
    const result = await resilientDelete({
      table: 'categories',
      idOrKey: id,
      fallbackFile: 'categories.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) existing category
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'categories',
      idOrKey: body.id,
      fallbackFile: 'categories.json',
      bodyData: {
        name: body.name.trim()
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

