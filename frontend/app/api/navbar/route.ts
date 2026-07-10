import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const navbarPath = path.join(process.cwd(), 'data', 'navbar.json');

export async function GET() {
  try {
    const data = await fs.readFile(navbarPath, 'utf-8');
    const json = JSON.parse(data);
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
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
    const { logo, name, fontFamily, fontSize, logoSize } = payload;
    if (!logo || !name || !fontFamily || typeof fontSize !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const newConfig = { 
      logo, 
      name, 
      fontFamily, 
      fontSize, 
      logoSize: typeof logoSize === 'number' ? logoSize : 104 
    };
    await fs.writeFile(navbarPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    return NextResponse.json(newConfig);
  } catch (error) {
    console.error('Error writing navbar config:', error);
    return NextResponse.json({ error: 'Failed to write navbar config' }, { status: 500 });
  }
}
