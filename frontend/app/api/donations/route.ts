import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete, resilientPost, resilientPut } from '@/lib/db-fallback';

// GET all donations
export async function GET() {
  let donations: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      donations = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'donations.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        donations = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to read donations fallback JSON:", e);
    }
  }

  return NextResponse.json(donations);
}

// POST new donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await resilientPost({
      table: 'donations',
      fallbackFile: 'donations.json',
      bodyData: {
        name: body.name,
        email: body.email || "",
        phone: body.phone || "",
        amount: body.amount,
        time: body.time || "Just now",
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
        payment_status: body.payment_status || "SUCCESS"
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT (Edit) donation
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = await resilientPut({
      table: 'donations',
      idOrKey: body.id,
      fallbackFile: 'donations.json',
      bodyData: {
        name: body.name,
        email: body.email || "",
        phone: body.phone || "",
        amount: body.amount,
        time: body.time,
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
        payment_status: body.payment_status || "SUCCESS"
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE donation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
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
