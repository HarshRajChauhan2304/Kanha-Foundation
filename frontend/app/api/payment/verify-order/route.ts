import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getFallbackPath } from '@/lib/db-fallback';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID || process.env.APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY || process.env.Secret_Key || process.env.SECRET_KEY;
    const isProd = process.env.CASHFREE_ENV === 'production';

    if (!appId || !secretKey) {
      console.error('Cashfree credentials missing in verify-order route.');
      return NextResponse.json({
        success: false,
        error: 'Payment gateway configuration is missing.'
      }, { status: 500 });
    }

    // 1. Fetch order status from Cashfree
    const cashfreeUrl = isProd
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cfResponse = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error(`Cashfree verification request failed for order ${orderId}:`, errorText);
      return NextResponse.json({
        success: false,
        error: `Cashfree Error: ${errorText}`
      }, { status: cfResponse.status });
    }

    const cfData = await cfResponse.json();
    const orderStatus = cfData.order_status; // e.g. PAID, ACTIVE, EXPIRED

    if (orderStatus !== 'PAID') {
      return NextResponse.json({
        success: false,
        payment_status: orderStatus,
        error: `Payment is not successful. Current status: ${orderStatus}`
      });
    }

    // 2. The payment is successful! Let's update the records.
    let updatedDonation: any = null;

    // A. Update in Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('donations')
        .update({ payment_status: 'SUCCESS' })
        .eq('receipt_id', orderId)
        .select()
        .single();

      if (!error && data) {
        updatedDonation = data;
      }
    } catch (dbErr) {
      console.warn('Failed to update donation in Supabase, falling back to local file update:', dbErr);
    }

    // B. Update in local fallback donations.json
    try {
      const fallbackPath = getFallbackPath('donations.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        const donations = JSON.parse(fileContent);
        if (Array.isArray(donations)) {
          const idx = donations.findIndex((d: any) => d.receipt_id === orderId);
          if (idx !== -1) {
            donations[idx].payment_status = 'SUCCESS';
            // Use the JSON record if database update failed or returned empty
            if (!updatedDonation) {
              updatedDonation = donations[idx];
            }
            fs.writeFileSync(fallbackPath, JSON.stringify(donations, null, 2), 'utf-8');
          }
        }
      }
    } catch (fsErr) {
      console.error('Failed to update local donations fallback file:', fsErr);
    }

    if (!updatedDonation) {
      return NextResponse.json({
        success: false,
        error: 'Donation record not found for the given order ID.'
      }, { status: 404 });
    }

    // 3. Recalculate statistics cards in the background/sync
    try {
      const fallbackPath = getFallbackPath('donations.json');
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
        const allDonations: any[] = JSON.parse(fileContent);

        let totalAmount = 0;
        let totalBirthday = 0;
        let totalMeals = 0;
        let totalLives = 0;
        let totalStudykit = 0;
        const donorSet = new Set<string>();

        allDonations.forEach(d => {
          if (d.payment_status !== 'SUCCESS') return;

          // Parse amount
          const clean = d.amount ? d.amount.replace(/[^\d.]/g, '') : '0';
          const amt = parseFloat(clean) || 0;
          totalAmount += amt;

          // Donor name
          if (d.name) {
            donorSet.add(d.name.trim().toLowerCase());
          }

          // Parse metadata metrics if present in time string
          let parsedBirthday = 0;
          let parsedMeals = 0;
          let parsedLives = 0;
          let parsedStudykit = 0;
          let hasMetaMetrics = false;

          if (d.time && d.time.includes('|')) {
            try {
              const meta = JSON.parse(d.time.split('|')[1]);
              if (meta) {
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

          // Fallback parsing if metadata metrics are missing
          if (!hasMetaMetrics) {
            const donationFor = (d.donation_for || '').toLowerCase();
            
            if (donationFor.includes('birthday') || donationFor.includes('celebration') || donationFor.includes('anniversary')) {
              parsedBirthday = amt;
            }
            if (donationFor.includes('thali') || donationFor.includes('meals') || donationFor.includes('feed') || 
                donationFor.includes('cows') || donationFor.includes('dogs') || donationFor.includes('chara') || 
                donationFor.includes('fodder') || donationFor.includes('food')) {
              parsedMeals = Math.round(amt / 30);
            }
            if (donationFor.includes('study') || donationFor.includes('notebook') || 
                (donationFor.includes('kit') && (donationFor.includes('study') || donationFor.includes('school') || donationFor.includes('education')))) {
              parsedStudykit = Math.round(amt / 150);
            }
            if (donationFor.includes('women') || donationFor.includes('hygiene') || donationFor.includes('menstrual') || 
                donationFor.includes('pad') || donationFor.includes('girl') || donationFor.includes('child') || 
                donationFor.includes('care') || donationFor.includes('water')) {
              parsedLives = Math.round(amt / 50);
            }
          }

          totalBirthday += parsedBirthday;
          totalMeals += parsedMeals;
          totalLives += parsedLives;
          totalStudykit += parsedStudykit;
        });

        const totalImpacted = totalLives + totalBirthday + totalMeals + totalStudykit;

        // Load and update stats_cards.json
        const statsFilePath = getFallbackPath('stats_cards.json');
        let existingCards: any[] = [];
        try {
          if (fs.existsSync(statsFilePath)) {
            existingCards = JSON.parse(fs.readFileSync(statsFilePath, 'utf-8'));
          }
        } catch (e) {}

        const updatedCards = existingCards.map(card => {
          switch (card.category) {
            case 'raised':
              return { ...card, base_value: totalAmount };
            case 'donors':
              return { ...card, base_value: donorSet.size };
            case 'birthday':
              return { ...card, base_value: totalBirthday };
            case 'lives':
              return { ...card, base_value: totalImpacted };
            case 'meals':
              return { ...card, base_value: totalMeals };
            case 'studykit':
              return { ...card, base_value: totalStudykit };
            default:
              return card;
          }
        });

        fs.writeFileSync(statsFilePath, JSON.stringify(updatedCards, null, 2), 'utf-8');
      }
    } catch (statsErr) {
      console.error('Failed to update stats cards in verify endpoint:', statsErr);
    }

    return NextResponse.json({
      success: true,
      donation: updatedDonation
    });

  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
