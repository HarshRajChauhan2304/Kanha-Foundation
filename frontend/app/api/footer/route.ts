import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { getFallbackPath } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultFooter = {
  logo: "/logo.png",
  companyOverview: [
    { label: "About Us", href: "/about" },
    { label: "Our Values", href: "/values" },
    { label: "Privacy Notice", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" }
  ],
  quickLinks: [
    { label: "Knowledge & FAQs", href: "/faqs" },
    { label: "Return & Refund Policy", href: "/refund" }
  ],
  contact: {
    email: "kanhafoundation223@gmail.com",
    ctaText: "Need help fast? Fill out our form or email"
  },
  social: [
    { platform: "Instagram", href: "https://www.instagram.com/kh_foundation_223/" },
    { platform: "Facebook", href: "https://www.facebook.com/profile.php?id=61564493773786" },
    { platform: "YouTube", href: "https://www.youtube.com/@KanhaFoundation-i8f" },
    { platform: "LinkedIn", href: "https://www.linkedin.com/in/kanha-foundation-635778400?" }
  ]
};

export async function GET() {
  try {
    const footerPath = getFallbackPath('footer.json');
    let json = defaultFooter;
    try {
      const data = await fs.readFile(footerPath, 'utf-8');
      json = JSON.parse(data);
    } catch {
      await fs.writeFile(footerPath, JSON.stringify(defaultFooter, null, 2), 'utf-8');
    }
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error reading footer config:', error);
    return NextResponse.json({ error: 'Failed to read footer config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const footerPath = getFallbackPath('footer.json');
    await fs.writeFile(footerPath, JSON.stringify(payload, null, 2), 'utf-8');
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error writing footer config:', error);
    return NextResponse.json({ error: 'Failed to write footer config' }, { status: 500 });
  }
}

