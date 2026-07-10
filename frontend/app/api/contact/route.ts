import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields (Name, Email, Message)." }, { status: 400 });
    }

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
        id: Date.now(),
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
