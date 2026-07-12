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

        // ---- Updated: Compute aggregated metrics and update static stats cards ----
        let totalAmount = 0;
        let totalBirthday = 0;
        let totalMeals = 0;
        let totalLives = 0;
        let totalStudykit = 0;
        const donorSet = new Set<string>();
        // impacted lives = lives + birthday + meals + studykit
        let totalImpacted = 0;

        data.forEach(d => {
          // amount
          const clean = d.amount ? d.amount.replace(/[^\d.]/g, '') : '0';
          const amt = parseFloat(clean) || 0;
          totalAmount += amt;

          // donor name
          if (d.name) donorSet.add(d.name.trim().toLowerCase());

          // Parse metadata if available
          let parsedBirthday = 0;
          let parsedMeals = 0;
          let parsedLives = 0;
          let parsedStudykit = 0;
          let hasMetaMetrics = false;

          if (d.time && d.time.includes('|')) {
            try {
              const meta = JSON.parse(d.time.split('|')[1]);
              if (meta) {
                // If the metadata contains at least one metric key, use it
                if (meta.meals !== undefined || meta.lives !== undefined || meta.studykit !== undefined || meta.birthday !== undefined) {
                  parsedBirthday = meta.birthday || 0;
                  parsedMeals = meta.meals || 0;
                  parsedLives = meta.lives || 0;
                  parsedStudykit = meta.studykit || 0;
                  hasMetaMetrics = true;
                }
              }
            } catch (_) {}
          }

          // Fallback parsing if metadata metrics are missing (e.g. for direct database inserts or manual admin inserts)
          if (!hasMetaMetrics) {
            const donationFor = (d.donation_for || "").toLowerCase();
            
            // 1. Birthday Campaign
            if (donationFor.includes("birthday") || donationFor.includes("celebration") || donationFor.includes("anniversary")) {
              parsedBirthday = amt;
            }
            
            // 2. Meals Served
            if (donationFor.includes("thali") || donationFor.includes("meals") || donationFor.includes("feed") || 
                donationFor.includes("cows") || donationFor.includes("dogs") || donationFor.includes("chara") || 
                donationFor.includes("fodder") || donationFor.includes("food")) {
              parsedMeals = Math.round(amt / 30);
            }
            
            // 3. Study Kits
            if (donationFor.includes("study") || donationFor.includes("notebook") || 
                (donationFor.includes("kit") && (donationFor.includes("study") || donationFor.includes("school") || donationFor.includes("education")))) {
              parsedStudykit = Math.round(amt / 150);
            }
            
            // 4. Lives Impacted (General Welfare)
            if (donationFor.includes("women") || donationFor.includes("hygiene") || donationFor.includes("menstrual") || 
                donationFor.includes("pad") || donationFor.includes("girl") || donationFor.includes("child") || 
                donationFor.includes("care") || donationFor.includes("water")) {
              parsedLives = Math.round(amt / 50);
            }
          }

          totalBirthday += parsedBirthday;
          totalMeals += parsedMeals;
          totalLives += parsedLives;
          totalStudykit += parsedStudykit;
        });

        // Compute impacted lives
        totalImpacted = totalLives + totalBirthday + totalMeals + totalStudykit;

        // Load existing stats cards
        const statsFilePath = getFallbackPath('stats_cards.json');
        let existingCards: any[] = [];
        try {
          if (fs.existsSync(statsFilePath)) {
            existingCards = JSON.parse(fs.readFileSync(statsFilePath, 'utf-8'));
          }
        } catch (e) { /* ignore */ }

        // Update cards by category
        const updatedCards = existingCards.map(card => {
          switch (card.category) {
            case 'raised':
              return { ...card, base_value: totalAmount };
            case 'donors':
              return { ...card, base_value: donorSet.size };
            case 'birthday':
              return { ...card, base_value: totalBirthday };
            case 'lives':
              // impacted lives includes birthday, meals, and studykit contributions
              return { ...card, base_value: totalImpacted };
            case 'meals':
              return { ...card, base_value: totalMeals };
            case 'studykit':
              return { ...card, base_value: totalStudykit };
            default:
              return card;
          }
        });

        try {
          const dir = path.dirname(statsFilePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(statsFilePath, JSON.stringify(updatedCards, null, 2), 'utf-8');
        } catch (e) { console.error('Failed to write stats cards:', e); }

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
    
    const result = await resilientPost({
      table: 'donations',
      fallbackFile: 'donations.json',
      bodyData: {
        name: body.name,
        address: body.address || "",
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
        address: body.address || "",
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
