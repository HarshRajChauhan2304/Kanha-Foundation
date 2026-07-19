import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { getFallbackPath } from '@/lib/db-fallback';

const getLocalTasks = (): any[] => {
  try {
    const dataPath = getFallbackPath('volunteer_tasks.json');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Error reading local volunteer tasks JSON:", e);
  }
  return [];
};

const saveLocalTasks = (tasks: any[]) => {
  try {
    const dataPath = getFallbackPath('volunteer_tasks.json');
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing local volunteer tasks JSON:", e);
  }
};

// GET tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const volunteerIdStr = searchParams.get('volunteer_id');
    const volunteerId = volunteerIdStr ? parseInt(volunteerIdStr, 10) : null;

    let tasks: any[] = [];
    let useFallback = false;

    try {
      let query = supabase.from('volunteer_tasks').select('*');
      if (volunteerId !== null) {
        query = query.eq('volunteer_id', volunteerId);
      }
      const { data, error } = await query.order('id', { ascending: false });

      if (error) {
        useFallback = true;
      } else {
        tasks = data || [];
      }
    } catch (err) {
      useFallback = true;
    }

    if (useFallback || tasks.length === 0) {
      const local = getLocalTasks();
      if (volunteerId !== null) {
        tasks = local.filter(t => t.volunteer_id === volunteerId);
      } else {
        tasks = local;
      }
    }

    return NextResponse.json({ success: true, tasks });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { volunteer_id, task_title, task_description, task_date, task_time, assigned_money } = body;

    if (!volunteer_id || !task_title || !task_date || !task_time) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newTask = {
      id: Date.now(),
      volunteer_id: parseInt(volunteer_id, 10),
      task_title,
      task_description: task_description || "",
      task_date,
      task_time,
      status: "Pending",
      assigned_money: parseFloat(assigned_money) || 0,
      created_at: new Date().toISOString()
    };

    // 1. Save locally
    const local = getLocalTasks();
    local.push(newTask);
    saveLocalTasks(local);

    // 2. Save in Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('volunteer_tasks')
        .insert([{
          volunteer_id: parseInt(volunteer_id, 10),
          task_title,
          task_description: task_description || null,
          task_date,
          task_time,
          status: "Pending",
          assigned_money: parseFloat(assigned_money) || 0
        }])
        .select()
        .single();

      if (!error && data) {
        // Replace temp id with Supabase id in local copy
        const updatedLocal = local.map(t => t.id === newTask.id ? data : t);
        saveLocalTasks(updatedLocal);
        return NextResponse.json({ success: true, task: data });
      } else {
        console.warn("Supabase tasks table bypass: ", error?.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase database insert bypassed: ", dbErr.message);
    }

    return NextResponse.json({ success: true, task: newTask, warning: "Saved to local fallback" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT edit task
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, volunteer_id, task_title, task_description, task_date, task_time, status, assigned_money, money_received, money_spent, proof_media, feedback } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    // 1. Update locally
    const local = getLocalTasks();
    const idx = local.findIndex(t => t.id === parseInt(id, 10));
    let updatedTask = null;
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...(volunteer_id && { volunteer_id: parseInt(volunteer_id, 10) }),
        ...(task_title && { task_title }),
        ...(task_description !== undefined && { task_description }),
        ...(task_date && { task_date }),
        ...(task_time && { task_time }),
        ...(status && { status }),
        ...(assigned_money !== undefined && { assigned_money: parseFloat(assigned_money) || 0 }),
        ...(money_received !== undefined && { money_received: parseFloat(money_received) || 0 }),
        ...(money_spent !== undefined && { money_spent: parseFloat(money_spent) || 0 }),
        ...(proof_media !== undefined && { proof_media }),
        ...(feedback !== undefined && { feedback })
      };
      updatedTask = local[idx];
      saveLocalTasks(local);
    }

    // 2. Update in Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('volunteer_tasks')
        .update({
          ...(volunteer_id && { volunteer_id: parseInt(volunteer_id, 10) }),
          ...(task_title && { task_title }),
          ...(task_description !== undefined && { task_description }),
          ...(task_date && { task_date }),
          ...(task_time && { task_time }),
          ...(status && { status }),
          ...(assigned_money !== undefined && { assigned_money: parseFloat(assigned_money) || 0 }),
          ...(money_received !== undefined && { money_received: parseFloat(money_received) || 0 }),
          ...(money_spent !== undefined && { money_spent: parseFloat(money_spent) || 0 }),
          ...(proof_media !== undefined && { proof_media }),
          ...(feedback !== undefined && { feedback })
        })
        .eq('id', parseInt(id, 10))
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, task: data });
      } else {
        console.warn("Supabase update bypass: ", error?.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase update bypassed: ", dbErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      task: updatedTask || body, 
      warning: "Updated locally" 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }
    const id = parseInt(idStr, 10);

    // 1. Delete locally
    const local = getLocalTasks();
    const updatedLocal = local.filter(t => t.id !== id);
    saveLocalTasks(updatedLocal);

    // 2. Delete in Supabase
    try {
      const { error } = await supabaseAdmin
        .from('volunteer_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn("Supabase task delete bypass: ", error.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase delete bypassed: ", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
