import { NextResponse } from 'next/server';
import fs from 'fs';
import { getFallbackPath } from '@/lib/db-fallback';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || '';

    let donations: any[] = [];
    const dataPath = getFallbackPath('donations.json');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      donations = JSON.parse(fileContent);
    }

    // Sort descending by id or date
    donations.sort((a, b) => (b.id || 0) - (a.id || 0));

    if (city.trim()) {
      const cityLower = city.trim().toLowerCase();
      const matched = donations.filter(d => d.address && d.address.toLowerCase().includes(cityLower));
      const unmatched = donations.filter(d => !d.address || !d.address.toLowerCase().includes(cityLower));
      donations = [...matched, ...unmatched];
    }

    const recent10 = donations.slice(0, 10);
    return NextResponse.json({ success: true, donations: recent10 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
