import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getFallbackPath, resilientPut, resilientPost } from '@/lib/db-fallback';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      donation_id, 
      volunteer_id, 
      task_title, 
      task_description, 
      task_date, 
      task_time, 
      assigned_money 
    } = body;

    if (!donation_id || !volunteer_id) {
      return NextResponse.json({ success: false, error: "Both donation_id and volunteer_id are required" }, { status: 400 });
    }

    const donId = parseInt(String(donation_id), 10);
    const volId = parseInt(String(volunteer_id), 10);

    // 1. Fetch volunteer info
    let volunteer: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('volunteer_applications')
        .select('*')
        .eq('id', volId)
        .single();
      if (data) volunteer = data;
    } catch (_) {}

    if (!volunteer) {
      try {
        const volPath = getFallbackPath('volunteers.json');
        if (fs.existsSync(volPath)) {
          const fileContent = fs.readFileSync(volPath, 'utf-8');
          const volList = JSON.parse(fileContent);
          volunteer = volList.find((v: any) => v.id === volId);
        }
      } catch (e) {
        console.error("Error reading volunteers fallback:", e);
      }
    }

    if (!volunteer) {
      return NextResponse.json({ success: false, error: "Volunteer not found" }, { status: 404 });
    }

    // 2. Fetch donation info
    let donation: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('donations')
        .select('*')
        .eq('id', donId)
        .single();
      if (data) donation = data;
    } catch (_) {}

    if (!donation) {
      try {
        const donPath = getFallbackPath('donations.json');
        if (fs.existsSync(donPath)) {
          const fileContent = fs.readFileSync(donPath, 'utf-8');
          const donList = JSON.parse(fileContent);
          donation = donList.find((d: any) => d.id === donId);
        }
      } catch (e) {
        console.error("Error reading donations fallback:", e);
      }
    }

    if (!donation) {
      return NextResponse.json({ success: false, error: "Donation record not found" }, { status: 404 });
    }

    // 3. Update donation with assigned volunteer details
    await resilientPut({
      table: 'donations',
      idOrKey: donId,
      fallbackFile: 'donations.json',
      bodyData: {
        ...donation,
        assigned_volunteer_id: volId,
        assigned_volunteer_name: volunteer.name
      }
    });

    // 4. Create or update volunteer task
    const defaultTitle = task_title || `Deliver Donation: ${donation.donation_for || 'General Cause'}`;
    const defaultDesc = task_description || `Donor: ${donation.name} | Location: ${donation.address || 'N/A'} | Cause: ${donation.donation_for || 'N/A'} | Amount: ${donation.amount || 'N/A'}`;
    const defaultDate = task_date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const defaultTime = task_time || '10:00 AM';
    
    const numAmount = parseFloat(String(assigned_money || donation.amount || '0').replace(/[^0-9.]/g, '')) || 0;

    // Check if task already exists for this donation_id
    let existingTask: any = null;
    try {
      const taskPath = getFallbackPath('volunteer_tasks.json');
      if (fs.existsSync(taskPath)) {
        const fileContent = fs.readFileSync(taskPath, 'utf-8');
        const tasksList = JSON.parse(fileContent);
        existingTask = tasksList.find((t: any) => String(t.donation_id) === String(donId));
      }
    } catch (_) {}

    let taskResult: any = null;
    if (existingTask) {
      taskResult = await resilientPut({
        table: 'volunteer_tasks',
        idOrKey: existingTask.id,
        fallbackFile: 'volunteer_tasks.json',
        bodyData: {
          ...existingTask,
          volunteer_id: volId,
          task_title: defaultTitle,
          task_description: defaultDesc,
          task_date: defaultDate,
          task_time: defaultTime,
          assigned_money: numAmount,
          donor_name: donation.name || '',
          donor_email: donation.email || '',
          donation_id: donId,
          cause: donation.donation_for || '',
          donation_amount: donation.amount || ''
        }
      });
    } else {
      taskResult = await resilientPost({
        table: 'volunteer_tasks',
        fallbackFile: 'volunteer_tasks.json',
        bodyData: {
          volunteer_id: volId,
          task_title: defaultTitle,
          task_description: defaultDesc,
          task_date: defaultDate,
          task_time: defaultTime,
          status: "Pending",
          assigned_money: numAmount,
          donor_name: donation.name || '',
          donor_email: donation.email || '',
          donation_id: donId,
          cause: donation.donation_for || '',
          donation_amount: donation.amount || '',
          is_premium: false,
          created_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      assigned_volunteer_id: volId,
      assigned_volunteer_name: volunteer.name,
      task: taskResult?.item || taskResult
    });
  } catch (error: any) {
    console.error("Error in assign-donation API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
