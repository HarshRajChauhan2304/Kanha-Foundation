import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut, getFallbackPath } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

// GET all donations
export async function GET() {
  let donations: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      useFallback = true;
    } else {
      // Sync DB state to fallback JSON file while preserving local address updates
      try {
        const fallbackPath = getFallbackPath('donations.json');
        let localData: any[] = [];
        if (fs.existsSync(fallbackPath)) {
          try {
            localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
          } catch (e) {}
        }

        const mergedData = data.map((dbItem: any) => {
          const localItem = Array.isArray(localData) ? localData.find((l: any) => String(l.id) === String(dbItem.id)) : null;
          return {
            ...dbItem,
            address: dbItem.address !== undefined && dbItem.address !== null ? dbItem.address : (localItem?.address || "")
          };
        });

        fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
        fs.writeFileSync(fallbackPath, JSON.stringify(mergedData, null, 2), 'utf-8');
        donations = mergedData;
      } catch (syncErr) {
        console.error("Failed to sync database donations to fallback JSON:", syncErr);
        donations = data;
      }
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = getFallbackPath('donations.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        donations = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read donations fallback JSON:", e);
    }
  }

  return NextResponse.json(donations, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  });
}

// POST new donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const meta = { meals: body.meals || 0, studykit: body.studykit || 0 };
    const timeMeta = `${body.time || "Just now"}|${JSON.stringify(meta)}`;
    const result = await resilientPost({
      table: 'donations',
      fallbackFile: 'donations.json',
      bodyData: {
        name: body.name,
        address: body.address || "",
        email: body.email || "",
        phone: body.phone || "",
        amount: body.amount,
        time: timeMeta,
        donation_for: body.donation_for || "General Support",
        is_anonymous: !!body.is_anonymous,
        printed_name: body.printed_name || "",
        delivery_date: body.delivery_date || "",
        photo_url: body.photo_url || "",
        video_wish: body.video_wish || "",
        instagram_id: body.instagram_id || "",
        is_gift: !!body.is_gift,
        gift_message: body.gift_message || "",
        is_other_request: !!body.is_other_request,
        other_request_text: body.other_request_text || "",
        receive_marketing: !!body.receive_marketing,
        marketing_phone: body.marketing_phone || "",
        marketing_email: body.marketing_email || "",
        is_dedicated: !!body.is_dedicated,
        dedicated_to: body.dedicated_to || "",
        dedication_msg: body.dedication_msg || "",
        receipt_id: body.receipt_id || "",
        transaction_date: body.transaction_date || "",
        payment_method: body.payment_method || "UPI",
        payment_status: body.payment_status || "SUCCESS",
        meals: body.meals || 0,
        studykit: body.studykit || 0
      }
    });

    return NextResponse.json({ success: result.success, item: result.item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) donation
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    const result = await resilientPut({
      table: 'donations',
      idOrKey: id,
      fallbackFile: 'donations.json',
      bodyData: {
        name: rest.name,
        address: rest.address || "",
        email: rest.email || "",
        phone: rest.phone || "",
        amount: rest.amount,
        time: rest.time,
        donation_for: rest.donation_for || "General Support",
        is_anonymous: !!rest.is_anonymous,
        printed_name: rest.printed_name || "",
        delivery_date: rest.delivery_date || "",
        photo_url: rest.photo_url || "",
        video_wish: rest.video_wish || "",
        instagram_id: rest.instagram_id || "",
        is_gift: !!rest.is_gift,
        gift_message: rest.gift_message || "",
        is_other_request: !!rest.is_other_request,
        other_request_text: rest.other_request_text || "",
        receive_marketing: !!rest.receive_marketing,
        marketing_phone: rest.marketing_phone || "",
        marketing_email: rest.marketing_email || "",
        is_dedicated: !!rest.is_dedicated,
        dedicated_to: rest.dedicated_to || "",
        dedication_msg: rest.dedication_msg || "",
        receipt_id: rest.receipt_id || "",
        transaction_date: rest.transaction_date || "",
        payment_method: rest.payment_method || "UPI",
        payment_status: rest.payment_status || "SUCCESS"
      }
    });

    return NextResponse.json({ success: result.success, item: result.item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE donation
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
      table: 'donations',
      idOrKey: id,
      fallbackFile: 'donations.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
