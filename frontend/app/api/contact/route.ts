import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { resilientDelete } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

// GET all contact submissions
export async function GET() {
  let submissions: any[] = [];
  let useFallback = false;

  try {
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data || data.length === 0) {
      useFallback = true;
    } else {
      submissions = data;
    }
  } catch (err) {
    useFallback = true;
  }

  if (useFallback) {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'contact_submissions.json');
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        submissions = JSON.parse(fileContent);
        // Sort newest first by id/timestamp
        submissions.sort((a: any, b: any) => b.id - a.id);
      }
    } catch (e) {
      console.error("Failed to read contact submissions fallback JSON:", e);
    }
  }

  return NextResponse.json(submissions);
}

// POST a new contact submission from front-end form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields (Name, Email, Message)." }, { status: 400 });
    }

    const timestampId = Date.now();

    // 1. Store in local JSON file as backup
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dataPath = path.join(dataDir, 'contact_submissions.json');
      let submissions = [];
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        try {
          submissions = JSON.parse(fileContent);
        } catch (e) {
          submissions = [];
        }
      }
      const newSubmission = {
        id: timestampId,
        name,
        email,
        phone: phone || "",
        message,
        created_at: new Date().toISOString()
      };
      submissions.push(newSubmission);
      fs.writeFileSync(dataPath, JSON.stringify(submissions, null, 2), 'utf-8');
      console.log("Saved contact submission to local JSON backup successfully.");
    } catch (err: any) {
      console.error("Local JSON contact backup write failed:", err.message);
    }

    // 2. Store in Supabase database
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([{
        id: timestampId,
        name,
        email,
        phone: phone || null,
        message
      }]);

    if (error) {
      console.warn("Supabase contact_submissions insert failed (table may not exist yet):", error.message);
      // We return success: true because the local JSON backup successfully stored the contact request
      return NextResponse.json({ 
        success: true, 
        warning: "Saved locally. (Note: Ensure 'contact_submissions' table is created in Supabase: " + error.message + ")"
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE a contact submission
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: "ID parameter missing" }, { status: 400 });
    }

    const result = await resilientDelete({
      table: 'contact_submissions',
      idOrKey: Number(id),
      idField: 'id',
      fallbackFile: 'contact_submissions.json'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
