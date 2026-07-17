import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut, getFallbackPath } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

// GET all beneficiaries
export async function GET() {
  let beneficiaries: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabaseAdmin
      .from('beneficiaries')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      useFallback = true;
    } else {
      // Sync DB state to fallback JSON file
      try {
        const fallbackPath = getFallbackPath('beneficiaries.json');
        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf-8');
        beneficiaries = data;
      } catch (syncErr) {
        console.error("Failed to sync database beneficiaries to fallback JSON:", syncErr);
        beneficiaries = data;
      }
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = getFallbackPath('beneficiaries.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        beneficiaries = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read beneficiaries fallback JSON:", e);
    }
  }

  return NextResponse.json(beneficiaries, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  });
}

// POST new beneficiary
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPost({
      table: 'beneficiaries',
      fallbackFile: 'beneficiaries.json',
      bodyData: {
        father_name: body.father_name,
        mother_name: body.mother_name,
        address: body.address,
        father_aadhar_number: body.father_aadhar_number || "",
        father_aadhar_upload_url: body.father_aadhar_upload_url || "",
        mother_aadhar_number: body.mother_aadhar_number || "",
        mother_aadhar_upload_url: body.mother_aadhar_upload_url || "",
        children: body.children || [],
        causes_donated: body.causes_donated || [],
        donation_pic_url: body.donation_pic_url || ""
      }
    });

    return NextResponse.json({ success: result.success, item: result.item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) beneficiary
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    const result = await resilientPut({
      table: 'beneficiaries',
      idOrKey: id,
      fallbackFile: 'beneficiaries.json',
      bodyData: {
        father_name: rest.father_name,
        mother_name: rest.mother_name,
        address: rest.address,
        father_aadhar_number: rest.father_aadhar_number || "",
        father_aadhar_upload_url: rest.father_aadhar_upload_url || "",
        mother_aadhar_number: rest.mother_aadhar_number || "",
        mother_aadhar_upload_url: rest.mother_aadhar_upload_url || "",
        children: rest.children || [],
        causes_donated: rest.causes_donated || [],
        donation_pic_url: rest.donation_pic_url || ""
      }
    });

    return NextResponse.json({ success: result.success, item: result.item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE beneficiary
export async function DELETE(request: Request) {
  try {
    let idStr = null;
    try {
      const body = await request.clone().json();
      idStr = body.id;
    } catch (e) {}

    if (!idStr) {
      const { searchParams } = new URL(request.url);
      idStr = searchParams.get('id');
    }

    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(String(idStr), 10);
    const result = await resilientDelete({
      table: 'beneficiaries',
      idOrKey: id,
      fallbackFile: 'beneficiaries.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
