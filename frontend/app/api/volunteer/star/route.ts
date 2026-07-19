import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { getFallbackPath } from '@/lib/db-fallback';

const getLocalStarVolunteers = (): any[] => {
  try {
    const dataPath = getFallbackPath('star_volunteers.json');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Error reading local star_volunteers.json:", e);
  }
  return [];
};

const saveLocalStarVolunteers = (stars: any[]) => {
  try {
    const dataPath = getFallbackPath('star_volunteers.json');
    fs.writeFileSync(dataPath, JSON.stringify(stars, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing local star_volunteers.json:", e);
  }
};

function calculateWeekLabel() {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  return `Week of ${firstDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

function mapToStar(vol: any, tasksCount: number, genderLabel: string) {
  let grade = "B";
  if (tasksCount >= 5) grade = "A+";
  else if (tasksCount >= 3) grade = "A";

  return {
    id: `auto-${vol.id}`,
    volunteer_id: vol.id,
    name: vol.name,
    gender: genderLabel,
    email: vol.email,
    phone: vol.phone,
    profile_photo: vol.profile_photo || "",
    grade,
    reason: `Outstanding performance this week with ${tasksCount} task drives completed!`,
    week_label: calculateWeekLabel(),
    tasks_completed: tasksCount,
    created_at: new Date().toISOString()
  };
}

export async function GET() {
  try {
    let manualStars: any[] = [];
    let useFallback = false;

    // 1. Fetch manual override star volunteers
    try {
      const { data, error } = await supabase
        .from('star_volunteers')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data || data.length === 0) {
        useFallback = true;
      } else {
        manualStars = data;
      }
    } catch (err) {
      useFallback = true;
    }

    if (useFallback) {
      manualStars = getLocalStarVolunteers();
    }

    // Try to find a male and female star from manual configuration
    let maleStar = manualStars.find(s => s.gender && (s.gender.toLowerCase().startsWith('m') || s.gender.toLowerCase() === 'boy'));
    let femaleStar = manualStars.find(s => s.gender && (s.gender.toLowerCase().startsWith('f') || s.gender.toLowerCase() === 'girl'));

    // 2. Fetch volunteers & tasks for automatic calculation fallback if either is missing
    let volunteers: any[] = [];
    let tasks: any[] = [];

    if (!maleStar || !femaleStar) {
      // Fetch volunteers
      try {
        const { data } = await supabaseAdmin.from('volunteer_applications').select('*');
        if (data) volunteers = data;
      } catch (e) {}
      if (volunteers.length === 0) {
        try {
          const fall = getFallbackPath('volunteer_applications.json');
          if (fs.existsSync(fall)) volunteers = JSON.parse(fs.readFileSync(fall, 'utf-8'));
        } catch (e) {}
      }

      // Fetch tasks
      try {
        const { data } = await supabase.from('volunteer_tasks').select('*');
        if (data) tasks = data;
      } catch (e) {}
      if (tasks.length === 0) {
        try {
          const fall = getFallbackPath('volunteer_tasks.json');
          if (fs.existsSync(fall)) tasks = JSON.parse(fs.readFileSync(fall, 'utf-8'));
        } catch (e) {}
      }
    }

    // Process volunteers and retrieve parsed profile photo and gender
    const cleanedVolunteers = volunteers.map((v: any) => {
      let newItem = { ...v };
      try {
        if (v.motivation && v.motivation.trim().startsWith('{')) {
          const parsed = JSON.parse(v.motivation);
          newItem.motivation = parsed.text || "";
          newItem.profile_photo = parsed.profile_photo || newItem.profile_photo || "";
          newItem.gender = parsed.gender || newItem.gender || "";
        }
      } catch (e) {}
      return newItem;
    });

    const completedTasks = tasks.filter(t => t.status === "Completed");
    const counts: { [key: string]: number } = {};
    completedTasks.forEach(t => {
      counts[t.volunteer_id] = (counts[t.volunteer_id] || 0) + 1;
    });

    // 3. Resolve Male Star Volunteer
    if (!maleStar) {
      const maleVolunteers = cleanedVolunteers.filter(v => v.gender && (v.gender.toLowerCase().startsWith('m') || v.gender.toLowerCase() === 'boy'));
      
      let topMaleVolId: string | null = null;
      let maxMaleCompleted = 0;
      maleVolunteers.forEach(v => {
        const volIdStr = String(v.id);
        const completionCount = counts[volIdStr] || 0;
        if (completionCount > maxMaleCompleted) {
          maxMaleCompleted = completionCount;
          topMaleVolId = volIdStr;
        }
      });

      if (topMaleVolId) {
        const vol = maleVolunteers.find(v => String(v.id) === topMaleVolId);
        if (vol) maleStar = mapToStar(vol, maxMaleCompleted, "Male");
      }

      if (!maleStar) {
        const vol = maleVolunteers[0];
        if (vol) {
          maleStar = mapToStar(vol, 0, "Male");
        } else {
          maleStar = {
            id: "fallback-male",
            volunteer_id: 1,
            name: "Rajesh Kumar",
            gender: "Male",
            email: "rajesh@example.com",
            phone: "+917488164529",
            profile_photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            grade: "A+",
            reason: "Successfully coordinated food drives for 50+ children this week.",
            week_label: calculateWeekLabel(),
            tasks_completed: 5,
            created_at: new Date().toISOString()
          };
        }
      }
    }

    // 4. Resolve Female Star Volunteer
    if (!femaleStar) {
      const femaleVolunteers = cleanedVolunteers.filter(v => v.gender && (v.gender.toLowerCase().startsWith('f') || v.gender.toLowerCase() === 'girl'));

      let topFemaleVolId: string | null = null;
      let maxFemaleCompleted = 0;
      femaleVolunteers.forEach(v => {
        const volIdStr = String(v.id);
        const completionCount = counts[volIdStr] || 0;
        if (completionCount > maxFemaleCompleted) {
          maxFemaleCompleted = completionCount;
          topFemaleVolId = volIdStr;
        }
      });

      if (topFemaleVolId) {
        const vol = femaleVolunteers.find(v => String(v.id) === topFemaleVolId);
        if (vol) femaleStar = mapToStar(vol, maxFemaleCompleted, "Female");
      }

      if (!femaleStar) {
        const vol = femaleVolunteers[0];
        if (vol) {
          femaleStar = mapToStar(vol, 0, "Female");
        } else {
          femaleStar = {
            id: "fallback-female",
            volunteer_id: 2,
            name: "Pooja Sharma",
            gender: "Female",
            email: "pooja@example.com",
            phone: "+917488164529",
            profile_photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            grade: "A+",
            reason: "Managed study kit distribution campaigns with outstanding leadership.",
            week_label: calculateWeekLabel(),
            tasks_completed: 4,
            created_at: new Date().toISOString()
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      stars: [maleStar, femaleStar]
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, gender, email, phone, profile_photo, grade, reason, week_label, volunteer_id } = body;

    if (!name || !gender || !grade || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newStar = {
      id: Date.now(),
      volunteer_id: volunteer_id ? parseInt(volunteer_id, 10) : null,
      name,
      gender,
      email: email || "",
      phone: phone || "",
      profile_photo: profile_photo || "",
      grade,
      reason,
      week_label: week_label || calculateWeekLabel(),
      tasks_completed: body.tasks_completed ? parseInt(body.tasks_completed, 10) : 0,
      created_at: new Date().toISOString()
    };

    // 1. Save locally
    const local = getLocalStarVolunteers();
    local.push(newStar);
    saveLocalStarVolunteers(local);

    // 2. Save to Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('star_volunteers')
        .insert([newStar])
        .select()
        .single();

      if (!error && data) {
        const updatedLocal = local.map(s => s.id === newStar.id ? data : s);
        saveLocalStarVolunteers(updatedLocal);
        return NextResponse.json({ success: true, star: data });
      } else {
        console.warn("Supabase insert star_volunteers bypassed:", error?.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase database error bypassed:", dbErr.message);
    }

    return NextResponse.json({ success: true, star: newStar, warning: "Saved to local fallback" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, gender, email, phone, profile_photo, grade, reason, week_label, tasks_completed, volunteer_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const numericId = parseInt(id, 10);

    // 1. Update locally
    const local = getLocalStarVolunteers();
    const idx = local.findIndex(s => s.id === numericId);
    let updatedStar = null;

    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...(name && { name }),
        ...(gender && { gender }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(profile_photo !== undefined && { profile_photo }),
        ...(grade && { grade }),
        ...(reason && { reason }),
        ...(week_label && { week_label }),
        ...(tasks_completed !== undefined && { tasks_completed: parseInt(tasks_completed, 10) }),
        ...(volunteer_id !== undefined && { volunteer_id: volunteer_id ? parseInt(volunteer_id, 10) : null })
      };
      updatedStar = local[idx];
      saveLocalStarVolunteers(local);
    }

    // 2. Update in Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('star_volunteers')
        .update({
          ...(name && { name }),
          ...(gender && { gender }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(profile_photo !== undefined && { profile_photo }),
          ...(grade && { grade }),
          ...(reason && { reason }),
          ...(week_label && { week_label }),
          ...(tasks_completed !== undefined && { tasks_completed: parseInt(tasks_completed, 10) }),
          ...(volunteer_id !== undefined && { volunteer_id: volunteer_id ? parseInt(volunteer_id, 10) : null })
        })
        .eq('id', numericId)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, star: data });
      } else {
        console.warn("Supabase update star_volunteers bypassed:", error?.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase database error bypassed:", dbErr.message);
    }

    return NextResponse.json({ success: true, star: updatedStar || body, warning: "Updated locally" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);

    // 1. Delete locally
    const local = getLocalStarVolunteers();
    const updatedLocal = local.filter(s => s.id !== id);
    saveLocalStarVolunteers(updatedLocal);

    // 2. Delete in Supabase
    try {
      const { error } = await supabaseAdmin
        .from('star_volunteers')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn("Supabase delete star_volunteers bypassed:", error.message);
      }
    } catch (dbErr: any) {
      console.warn("Supabase database error bypassed:", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
