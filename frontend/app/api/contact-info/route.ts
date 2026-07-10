import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

// GET all contact details
export async function GET() {
  let contactInfo: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      contactInfo = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'contact_info.json');
      if (fs.existsSync(fallbackPath)) {
        contactInfo = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      } else {
        contactInfo = [
          { id: 1, title: "Registered Address", value: "Kanha Foundation Office,\nRanchi, Jharkhand, 834001, India", type: "address", icon: "map-pin" },
          { id: 2, title: "Email Inquiry", value: "support@kanhafoundation.org", type: "email", icon: "mail" },
          { id: 3, title: "WhatsApp Support", value: "+91 74881 64529", type: "whatsapp", icon: "whatsapp" }
        ];
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(contactInfo, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("Failed to read contact_info fallback JSON:", e);
    }
  }

  return NextResponse.json(contactInfo);
}

// POST a new contact detail
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, value, type, icon } = body;

    if (!title || !value || !type || !icon) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await resilientPost({
      table: 'contact_info',
      fallbackFile: 'contact_info.json',
      bodyData: { title, value, type, icon },
      idField: 'id'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) an existing contact detail
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, value, type, icon } = body;

    if (!id || !title || !value || !type || !icon) {
      return NextResponse.json({ success: false, error: "ID and all details are required" }, { status: 400 });
    }

    const result = await resilientPut({
      table: 'contact_info',
      idOrKey: Number(id),
      idField: 'id',
      fallbackFile: 'contact_info.json',
      bodyData: { title, value, type, icon }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a contact detail
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: "ID parameter missing" }, { status: 400 });
    }

    const result = await resilientDelete({
      table: 'contact_info',
      idOrKey: Number(id),
      idField: 'id',
      fallbackFile: 'contact_info.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
