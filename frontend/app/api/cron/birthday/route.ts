import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { getFallbackPath } from '@/lib/db-fallback';

// Safely load nodemailer if available
let nodemailer: any = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer module optional
}

// Helper function to extract MM-DD from YYYY-MM-DD or string date
function getMonthDay(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (!clean) return null;

  // Pattern YYYY-MM-DD or DD-MM-YYYY
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      if (parts[0].length === 4) {
        return `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      // DD-MM-YYYY
      if (parts[2].length === 4) {
        return `${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  try {
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${mm}-${dd}`;
    }
  } catch (e) {}

  return null;
}

// Nodemailer Transporter generator
function createTransporter() {
  if (!nodemailer) return null;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
}

async function sendBirthdayEmail(toEmail: string, name: string, userType: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const donateUrl = `${siteUrl}/donate?cause=birthday`;

  const subject = `🎉 Happy Birthday ${name}! Wish from Kanha Foundation 🎂`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #f59e0b;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 50px;">🎂</span>
        <h1 style="color: #f59e0b; font-size: 28px; margin-top: 10px;">Happy Birthday, ${name}! 🎉</h1>
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6;">
          On this beautiful day, the entire <strong>Kanha Foundation</strong> family wishes you endless happiness, good health, and abundant joy!
        </p>
      </div>

      <div style="background: #27272a; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #fbbf24; margin-top: 0;">🎁 Make Your Birthday Unforgettable</h3>
        <p style="color: #d4d4d8; font-size: 14px; margin-bottom: 15px;">
          Celebrate your birthday by spreading warmth and smiles to underprivileged children in slums. Sponsoring a meal or birthday cake for slum kids turns your celebration into a lifetime memory.
        </p>
        <div style="text-align: center;">
          <a href="${donateUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
            Donate on My Birthday 🎁
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #3f3f46; padding-top: 15px; font-size: 12px; color: #a1a1aa;">
        <p>Kanha Foundation &copy; ${new Date().getFullYear()} | Direct Grassroots Impact</p>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Kanha Foundation" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      return { sent: true, mode: 'SMTP' };
    } catch (e: any) {
      console.error("Nodemailer send failed:", e);
    }
  }

  // Simulated Email Dispatch fallback logging
  console.log(`
=========================================================
[SIMULATED BIRTHDAY EMAIL DISPATCH]
To: ${toEmail}
Subject: ${subject}
Message: Happy Birthday ${name}! Sponsor a meal on your special day at ${donateUrl}
=========================================================
  `);
  return { sent: true, mode: 'SIMULATED' };
}

function formatWhatsAppMessage(name: string, phone: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const donateUrl = `${siteUrl}/donate?cause=birthday`;

  const messageText = `🎉 *Happy Birthday, ${name}!* 🎂%0A%0AThe *Kanha Foundation* team wishes you a wonderful birthday filled with joy and health!%0A%0A🎁 *Make your birthday extra special:* Celebrate today by sharing smiles with slum children. Sponsor a birthday meal or cake here:%0A👉 ${donateUrl}%0A%0AWith warm wishes,%0AKanha Foundation Team`;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${messageText}`;

  console.log(`
=========================================================
[SIMULATED WHATSAPP BIRTHDAY DISPATCH]
To Phone: ${phone} (${cleanPhone})
Message: Happy Birthday ${name}! Celebrate by giving back: ${donateUrl}
WhatsApp Direct Link: ${waLink}
=========================================================
  `);

  return { phone, cleanPhone, waLink, text: messageText };
}

export async function GET() {
  return handleBirthdayCheck();
}

export async function POST() {
  return handleBirthdayCheck();
}

async function handleBirthdayCheck() {
  try {
    const today = new Date();
    const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const birthdayRecords: Array<{ name: string; email: string; phone: string; type: string; dob: string }> = [];

    // 1. Check Users (Supabase + Local JSON)
    let users: any[] = [];
    try {
      const { data } = await supabaseAdmin.from('users').select('*');
      if (data && data.length > 0) users = data;
    } catch (e) {}

    try {
      const usersJsonPath = getFallbackPath('users.json');
      if (fs.existsSync(usersJsonPath)) {
        const localUsers = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
        if (Array.isArray(localUsers)) {
          // Merge local users
          localUsers.forEach((lu: any) => {
            if (!users.some(u => u.email?.trim().toLowerCase() === lu.email?.trim().toLowerCase())) {
              users.push(lu);
            }
          });
        }
      }
    } catch (e) {}

    users.forEach((u: any) => {
      const uMMDD = getMonthDay(u.dob);
      if (uMMDD === todayMMDD) {
        birthdayRecords.push({
          name: u.username || u.name || 'Valued Member',
          email: u.email || '',
          phone: u.phone || '',
          type: 'User',
          dob: u.dob
        });
      }
    });

    // 2. Check Volunteers (Supabase + Local JSON)
    let volunteers: any[] = [];
    try {
      const { data } = await supabaseAdmin.from('volunteer_applications').select('*');
      if (data && data.length > 0) volunteers = data;
    } catch (e) {}

    try {
      const volJsonPath = getFallbackPath('volunteer_applications.json');
      if (fs.existsSync(volJsonPath)) {
        const localVols = JSON.parse(fs.readFileSync(volJsonPath, 'utf-8'));
        if (Array.isArray(localVols)) {
          localVols.forEach((lv: any) => {
            if (!volunteers.some(v => v.email?.trim().toLowerCase() === lv.email?.trim().toLowerCase())) {
              volunteers.push(lv);
            }
          });
        }
      }
    } catch (e) {}

    volunteers.forEach((v: any) => {
      const vMMDD = getMonthDay(v.dob);
      if (vMMDD === todayMMDD) {
        // Avoid duplicate if registered as both user and volunteer with same email
        if (!birthdayRecords.some(r => r.email?.trim().toLowerCase() === v.email?.trim().toLowerCase())) {
          birthdayRecords.push({
            name: v.name || 'Volunteer',
            email: v.email || '',
            phone: v.phone || '',
            type: 'Volunteer',
            dob: v.dob
          });
        }
      }
    });

    // 3. Process Notifications (Email & WhatsApp)
    const results = [];
    for (const record of birthdayRecords) {
      let emailRes = { sent: false, mode: 'NONE' };
      if (record.email) {
        emailRes = await sendBirthdayEmail(record.email, record.name, record.type);
      }

      let waRes = null;
      if (record.phone) {
        waRes = formatWhatsAppMessage(record.name, record.phone);
      }

      results.push({
        name: record.name,
        email: record.email,
        phone: record.phone,
        type: record.type,
        emailStatus: emailRes,
        whatsapp: waRes
      });
    }

    return NextResponse.json({
      success: true,
      today: todayMMDD,
      totalBirthdaysToday: birthdayRecords.length,
      birthdaysProcessed: results
    });

  } catch (error: any) {
    console.error("Cron Birthday API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
