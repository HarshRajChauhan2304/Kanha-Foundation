import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getFallbackPath } from '@/lib/db-fallback';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = (searchParams.get('email') || '').trim().toLowerCase();
    const phoneParam = (searchParams.get('phone') || '').trim().replace(/[^0-9]/g, '');
    const nameParam = (searchParams.get('name') || '').trim().toLowerCase();

    if (!emailParam && !phoneParam && !nameParam) {
      return NextResponse.json({ success: true, donations: [] });
    }

    let allDonations: any[] = [];
    let useFallback = false;

    try {
      const { data, error } = await supabaseAdmin
        .from('donations')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) {
        useFallback = true;
      } else {
        allDonations = data;
      }
    } catch (err) {
      useFallback = true;
    }

    if (useFallback || allDonations.length === 0) {
      try {
        const fallbackPath = getFallbackPath('donations.json');
        if (fs.existsSync(fallbackPath)) {
          const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
          allDonations = JSON.parse(fileContent);
        }
      } catch (e) {
        console.error("Failed to read fallback donations.json:", e);
      }
    }

    // Filter matching donations
    const userDonations = allDonations.filter(d => {
      if (!d) return false;

      const dEmail = (d.email || '').trim().toLowerCase();
      const dPhone = (d.phone || '').trim().replace(/[^0-9]/g, '');
      const dMarketingEmail = (d.marketing_email || '').trim().toLowerCase();
      const dMarketingPhone = (d.marketing_phone || '').trim().replace(/[^0-9]/g, '');
      const dName = (d.name || '').trim().toLowerCase();

      // Check time metadata for email/phone if present
      let timeEmail = '';
      let timePhone = '';
      if (d.time && d.time.includes('|')) {
        try {
          const meta = JSON.parse(d.time.split('|')[1]);
          if (meta?.marketing?.marketingEmail) timeEmail = meta.marketing.marketingEmail.trim().toLowerCase();
          if (meta?.marketing?.marketingPhone) timePhone = meta.marketing.marketingPhone.trim().replace(/[^0-9]/g, '');
        } catch (_) {}
      }

      const donationEmail = dEmail || dMarketingEmail || timeEmail;
      const donationPhone = dPhone || dMarketingPhone || timePhone;

      // 1. If email is specified by caller:
      if (emailParam) {
        if (donationEmail) {
          // If donation has an email recorded, it MUST match the user's email
          return donationEmail === emailParam;
        }
        // If donation has no email recorded, fall back to phone AND name match
        if (phoneParam && phoneParam.length >= 7 && donationPhone) {
          const phoneMatches = donationPhone.endsWith(phoneParam) || phoneParam.endsWith(donationPhone);
          if (nameParam && dName) {
            return phoneMatches && dName === nameParam;
          }
          return phoneMatches;
        }
        return false;
      }

      // 2. If no email specified, match by phone:
      if (phoneParam && phoneParam.length >= 7 && donationPhone) {
        const phoneMatches = donationPhone.endsWith(phoneParam) || phoneParam.endsWith(donationPhone);
        if (nameParam && dName) {
          return phoneMatches && dName === nameParam;
        }
        return phoneMatches;
      }

      // 3. Fallback match by name:
      if (nameParam && nameParam.length > 2) {
        return dName === nameParam;
      }

      return false;
    });

    // Sort descending by id or date
    userDonations.sort((a, b) => (b.id || 0) - (a.id || 0));

    return NextResponse.json({ success: true, donations: userDonations }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error("Error in by-user donations route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
