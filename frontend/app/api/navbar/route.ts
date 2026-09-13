import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const navbarPath = path.join(process.cwd(), 'data', 'navbar.json');

export async function GET() {
  try {
    const data = await fs.readFile(navbarPath, 'utf-8');
    const json = JSON.parse(data);
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error reading navbar config:', error);
    return NextResponse.json({ error: 'Failed to read navbar config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { logo, name, fontFamily, fontSize, logoSize } = payload || {};

    const newConfig = { 
      logo: typeof logo === 'string' ? logo : '', 
      name: typeof name === 'string' ? name : '', 
      fontFamily: typeof fontFamily === 'string' ? fontFamily : 'Outfit', 
      fontSize: typeof fontSize === 'number' ? fontSize : 20, 
      logoSize: typeof logoSize === 'number' ? logoSize : 104 
    };

    await fs.writeFile(navbarPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    return NextResponse.json(newConfig);
  } catch (error) {
    console.error('Error writing navbar config:', error);
    return NextResponse.json({ error: 'Failed to write navbar config' }, { status: 500 });
  }
}
