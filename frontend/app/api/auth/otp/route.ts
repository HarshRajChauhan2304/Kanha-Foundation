import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const getOTPFilePath = () => path.join(process.cwd(), 'data', 'otps.json');

const readOTPs = (): Record<string, { otp: string; expiresAt: number }> => {
  try {
    const filePath = getOTPFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading OTPs:", e);
  }
  return {};
};

const writeOTPs = (data: Record<string, { otp: string; expiresAt: number }>) => {
  try {
    const filePath = getOTPFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing OTPs:", e);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, otp } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ==========================================
    // ACTION: Send OTP
    // ==========================================
    if (action === "send") {
      // 1. Check if email already exists in users table/JSON
      let emailExists = false;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('email', cleanEmail)
          .single();
        if (data) emailExists = true;
      } catch (e) {}

      if (!emailExists) {
        try {
          const filePath = path.join(process.cwd(), 'data', 'users.json');
          if (fs.existsSync(filePath)) {
            const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (users.some((u: any) => u.email?.trim().toLowerCase() === cleanEmail)) {
              emailExists = true;
            }
          }
        } catch (e) {}
      }

      if (emailExists) {
        return NextResponse.json({ success: false, error: "An account is already registered with this email." }, { status: 400 });
      }

      // 2. Generate a 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

      // 3. Save OTP details
      const otps = readOTPs();
      otps[cleanEmail] = { otp: code, expiresAt };
      writeOTPs(otps);

      // 4. Log the simulated email verification log
      console.log(`
=========================================================
[SMTP EMAIL SIMULATOR] Sending Email Verification OTP...
To: ${cleanEmail}
Subject: Email Verification OTP - Kanha Foundation
Body:
  Hello,

  Thank you for signing up with Kanha Foundation.
  Your 6-digit Email Verification code is:

  👉 ${code} 👈

  This OTP is valid for the next 10 minutes.
=========================================================
      `);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your email.",
        simulatedOtp: code // For easy visual testing if terminal log is not accessible
      });
    }

    // OTP verification route removed as email verification is no longer required.
  } catch (error: any) {
    console.error("OTP API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
