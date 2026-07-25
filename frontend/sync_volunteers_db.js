const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncVolunteers() {
  const jsonPath = path.resolve(__dirname, 'data', 'volunteer_applications.json');
  if (!fs.existsSync(jsonPath)) {
    console.log("No volunteer applications file found to sync.");
    return;
  }

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const applications = JSON.parse(fileData);
  console.log(`Found ${applications.length} volunteers. Syncing...`);

  for (const app of applications) {
    const motivationSerialized = typeof app.motivation === 'object' 
      ? JSON.stringify(app.motivation) 
      : (app.motivation || '');

    const payload = {
      name: app.name,
      email: app.email,
      phone: app.phone,
      city: app.city,
      motivation: motivationSerialized,
      skills: app.skills,
      status: app.status,
      password: app.password,
      profile_photo: app.profile_photo || '',
      gender: app.gender || ''
    };

    const isIdWithinIntRange = app.id <= 2147483647;

    if (isIdWithinIntRange) {
      const { error } = await supabase.from('volunteer_applications').update(payload).eq('id', app.id);
      if (error) {
        // Attempt insert
        await supabase.from('volunteer_applications').insert({ id: app.id, ...payload });
      }
    } else {
      const { data } = await supabase.from('volunteer_applications').select('id').eq('phone', app.phone).maybeSingle();
      if (data) {
        await supabase.from('volunteer_applications').update(payload).eq('id', data.id);
      } else {
        await supabase.from('volunteer_applications').insert(payload);
      }
    }
  }
  console.log("Volunteer applications synced!");
}

async function syncUsers() {
  const jsonPath = path.resolve(__dirname, 'data', 'users.json');
  if (!fs.existsSync(jsonPath)) {
    console.log("No users file found to sync.");
    return;
  }

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const users = JSON.parse(fileData);
  console.log(`Found ${users.length} users. Syncing...`);

  for (const u of users) {
    let phoneClean = u.phone || '';
    let genderClean = u.gender || '';
    if (phoneClean.includes("__GENDER:")) {
      const parts = phoneClean.split("__GENDER:");
      phoneClean = parts[0];
      genderClean = parts[1];
    }

    const payload = {
      username: u.username,
      email: u.email,
      phone: phoneClean,
      password: u.password,
      avatar: u.avatar || '',
      gender: genderClean || '',
      bio: u.bio || ''
    };

    const isIdWithinIntRange = u.id <= 2147483647;

    if (isIdWithinIntRange) {
      const { error } = await supabase.from('users').update(payload).eq('id', u.id);
      if (error) {
        await supabase.from('users').insert({ id: u.id, ...payload });
      }
    } else {
      const { data } = await supabase.from('users').select('id').eq('email', u.email).maybeSingle();
      if (data) {
        await supabase.from('users').update(payload).eq('id', data.id);
      } else {
        await supabase.from('users').insert(payload);
      }
    }
  }
  console.log("Users synced!");
}

async function syncAdmins() {
  const jsonPath = path.resolve(__dirname, 'data', 'admin_users.json');
  if (!fs.existsSync(jsonPath)) {
    console.log("No admin users file found to sync.");
    return;
  }

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const admins = JSON.parse(fileData);
  console.log(`Found ${admins.length} admins. Syncing...`);

  for (const a of admins) {
    const payload = {
      username: a.username,
      email: a.email,
      phone: a.phone || '',
      password: a.password,
      avatar: a.avatar || ''
    };

    const isIdWithinIntRange = a.id ? (a.id <= 2147483647) : false;

    if (isIdWithinIntRange) {
      const { error } = await supabase.from('admin_users').update(payload).eq('id', a.id);
      if (error) {
        await supabase.from('admin_users').insert({ id: a.id, ...payload });
      }
    } else {
      const { data } = await supabase.from('admin_users').select('id').eq('email', a.email).maybeSingle();
      if (data) {
        await supabase.from('admin_users').update(payload).eq('id', data.id);
      } else {
        await supabase.from('admin_users').insert(payload);
      }
    }
  }
  console.log("Admins synced!");
}

async function syncVolunteerTasks() {
  const jsonPath = path.resolve(__dirname, 'data', 'volunteer_tasks.json');
  if (!fs.existsSync(jsonPath)) {
    console.log("No volunteer tasks file found to sync.");
    return;
  }

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const tasks = JSON.parse(fileData);
  console.log(`Found ${tasks.length} volunteer tasks. Syncing...`);

  for (const t of tasks) {
    const payload = {
      volunteer_id: t.volunteer_id,
      task_title: t.task_title,
      task_description: t.task_description || '',
      task_date: t.task_date,
      task_time: t.task_time,
      status: t.status || 'Pending',
      assigned_money: t.assigned_money || 0,
      money_received: t.money_received || 0,
      money_spent: t.money_spent || 0,
      proof_media: t.proof_media || '',
      feedback: t.feedback || ''
    };

    const isIdWithinIntRange = t.id ? (t.id <= 2147483647) : false;

    if (isIdWithinIntRange) {
      const { error } = await supabase.from('volunteer_tasks').update(payload).eq('id', t.id);
      if (error) {
        await supabase.from('volunteer_tasks').insert({ id: t.id, ...payload });
      }
    } else {
      const { data } = await supabase.from('volunteer_tasks').select('id')
        .eq('volunteer_id', t.volunteer_id)
        .eq('task_title', t.task_title)
        .eq('task_date', t.task_date)
        .maybeSingle();

      if (data) {
        await supabase.from('volunteer_tasks').update(payload).eq('id', data.id);
      } else {
        await supabase.from('volunteer_tasks').insert(payload);
      }
    }
  }
  console.log("Volunteer tasks synced!");
}

async function run() {
  try {
    await syncVolunteers();
    await syncUsers();
    await syncAdmins();
    await syncVolunteerTasks();
    console.log("All tables synchronization completed successfully!");
  } catch (error) {
    console.error("Synchronization failed:", error);
  }
}

run();
