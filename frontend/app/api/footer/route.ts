import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const footerPath = path.join(process.cwd(), 'data', 'footer.json');

export async function GET() {
  try {
    const data = await fs.readFile(footerPath, 'utf-8');
    const json = JSON.parse(data);
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
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
    // Basic validation: ensure payload is an object
    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await fs.writeFile(footerPath, JSON.stringify(payload, null, 2), 'utf-8');
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error writing footer config:', error);
    return NextResponse.json({ error: 'Failed to write footer config' }, { status: 500 });
  }
}
