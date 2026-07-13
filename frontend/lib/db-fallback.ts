import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

export function getFallbackPath(fallbackFile: string): string {
  const cwd = process.cwd();
  // If cwd is already inside the frontend directory, do not append 'frontend' again.
  let baseDir = cwd;
  if (path.basename(cwd) !== 'frontend' && fs.existsSync(path.join(cwd, 'frontend'))) {
    baseDir = path.join(cwd, 'frontend');
  }
  const fallbackPath = path.join(baseDir, 'data', fallbackFile);
  // Ensure the directory exists before returning the path.
  if (!fs.existsSync(path.dirname(fallbackPath))) {
    fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
  }
  return fallbackPath;
}


interface ResilientOptions {
  table: string;
  idOrKey?: any;
  idField?: string;
  fallbackFile: string;
  bodyData?: any;
}

export async function resilientDelete({
  table,
  idOrKey,
  idField = 'id',
  fallbackFile
}: ResilientOptions) {
  try {
    // Attempt Supabase deletion only if the ID fits in a standard 32-bit signed integer
    const numericId = typeof idOrKey === 'number' ? idOrKey : parseInt(String(idOrKey), 10);
    if (!isNaN(numericId) && numericId <= 2147483647) {
      await supabaseAdmin.from(table).delete().eq(idField, idOrKey);
    }
  } catch (dbErr) {
    console.warn(`Supabase DB delete failed for ${table}, using local fallback:`, dbErr);
  }

  // Perform local file fallback sync
  try {
    const fallbackPath = getFallbackPath(fallbackFile);
    if (fs.existsSync(fallbackPath)) {
      const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
      let data = JSON.parse(fileContent);

      if (Array.isArray(data)) {
        data = data.filter((item: any) => String(item[idField]) !== String(idOrKey));
      } else if (data && typeof data === 'object') {
        // Handle highlights schema
        if (table === 'directors' && Array.isArray(data.directors)) {
          data.directors = data.directors.filter((item: any) => String(item[idField]) !== String(idOrKey));
        } else if (table === 'volunteers' && Array.isArray(data.volunteers)) {
          data.volunteers = data.volunteers.filter((item: any) => String(item[idField]) !== String(idOrKey));
        }
      }
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`Local JSON file deletion failed for ${fallbackFile}:`, err);
  }

  return { success: true };
}

export async function resilientPost({
  table,
  fallbackFile,
  bodyData,
  idField = 'id'
}: ResilientOptions) {
  let dbResult: any = null;
  let dbSucceeded = false;

  try {
    let supabaseData = { ...bodyData };
    if (table === 'volunteer_applications') {
      supabaseData.motivation = JSON.stringify({
        text: bodyData.motivation || "",
        profile_photo: bodyData.profile_photo || "",
        gender: bodyData.gender || ""
      });
      delete supabaseData.terms_accepted;
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .insert([supabaseData])
      .select()
      .single();

    if (!error && data) {
      dbResult = data;
      // Deserialize database record back to standard fields before returning
      try {
        if (dbResult.motivation && dbResult.motivation.trim().startsWith('{')) {
          const parsed = JSON.parse(dbResult.motivation);
          dbResult.motivation = parsed.text || "";
          dbResult.profile_photo = parsed.profile_photo || "";
          dbResult.gender = parsed.gender || "";
        }
      } catch (e) {}
      dbSucceeded = true;
    }
  } catch (dbErr) {
    console.warn(`Supabase DB insert failed for ${table}, using local fallback:`, dbErr);
  }

  // Sync to fallback file
  try {
    const fallbackPath = getFallbackPath(fallbackFile);
    let currentData: any = [];

    if (fs.existsSync(fallbackPath)) {
      currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }

    const newRecord = {
      ...bodyData,
      [idField]: dbSucceeded && dbResult ? dbResult[idField] : (bodyData[idField] || Math.floor(Math.random() * 2000000000) + 1)
    };

    if (Array.isArray(currentData)) {
      const idx = currentData.findIndex((item: any) => String(item[idField]) === String(newRecord[idField]));
      if (idx !== -1) {
        currentData[idx] = { ...currentData[idx], ...newRecord };
      } else {
        currentData.push(newRecord);
      }
    } else if (currentData && typeof currentData === 'object') {
      if (table === 'directors') {
        if (!Array.isArray(currentData.directors)) currentData.directors = [];
        currentData.directors.push(newRecord);
      } else if (table === 'volunteers') {
        if (!Array.isArray(currentData.volunteers)) currentData.volunteers = [];
        currentData.volunteers.push(newRecord);
      }
    }

    fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
    fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2), 'utf-8');
    
    return { success: true, item: newRecord };
  } catch (err) {
    console.error(`Local JSON file insert failed for ${fallbackFile}:`, err);
  }

  return { success: dbSucceeded, item: dbResult };
}

export async function resilientPut({
  table,
  idOrKey,
  idField = 'id',
  fallbackFile,
  bodyData
}: ResilientOptions) {
  let dbResult: any = null;
  let dbSucceeded = false;

  try {
    let supabaseData = { ...bodyData };
    if (table === 'volunteer_applications') {
      supabaseData.motivation = JSON.stringify({
        text: bodyData.motivation || "",
        profile_photo: bodyData.profile_photo || "",
        gender: bodyData.gender || ""
      });
      delete supabaseData.terms_accepted;
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .update(supabaseData)
      .eq(idField, idOrKey)
      .select()
      .single();

    if (!error && data) {
      dbResult = data;
      // Deserialize database record back to standard fields before returning
      try {
        if (dbResult.motivation && dbResult.motivation.trim().startsWith('{')) {
          const parsed = JSON.parse(dbResult.motivation);
          dbResult.motivation = parsed.text || "";
          dbResult.profile_photo = parsed.profile_photo || "";
          dbResult.gender = parsed.gender || "";
        }
      } catch (e) {}
      dbSucceeded = true;
    }
  } catch (dbErr) {
    console.warn(`Supabase DB update failed for ${table}, using local fallback:`, dbErr);
  }

  // Sync to fallback file
  try {
    const fallbackPath = getFallbackPath(fallbackFile);
    if (fs.existsSync(fallbackPath)) {
      let currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));

      if (Array.isArray(currentData)) {
        const idx = currentData.findIndex((item: any) => String(item[idField]) === String(idOrKey));
        if (idx !== -1) {
          currentData[idx] = { ...currentData[idx], ...bodyData };
        } else {
          currentData.push({ ...bodyData, [idField]: idOrKey });
        }
      } else if (currentData && typeof currentData === 'object') {
        if (table === 'directors' && Array.isArray(currentData.directors)) {
          const idx = currentData.directors.findIndex((item: any) => String(item[idField]) === String(idOrKey));
          if (idx !== -1) currentData.directors[idx] = { ...currentData.directors[idx], ...bodyData };
        } else if (table === 'volunteers' && Array.isArray(currentData.volunteers)) {
          const idx = currentData.volunteers.findIndex((item: any) => String(item[idField]) === String(idOrKey));
          if (idx !== -1) currentData.volunteers[idx] = { ...currentData.volunteers[idx], ...bodyData };
        }
      }

      fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2), 'utf-8');
      return { success: true, item: { ...bodyData, [idField]: idOrKey } };
    }
  } catch (err) {
    console.error(`Local JSON file update failed for ${fallbackFile}:`, err);
  }

  return { success: dbSucceeded, item: dbResult };
}

export async function syncVolunteerToHighlights(app: {
  name: string;
  motivation?: string;
  profile_photo?: string;
  gender?: string;
}) {
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
  const name = app.name;
  const role = "Volunteer"; // Default designation
  const image = app.profile_photo || defaultAvatar;
  const quote = app.motivation || "Proud to be a volunteer at Kanha Foundation!";

  // 1. Supabase insert/update
  let dbResult: any = null;
  let dbSucceeded = false;
  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from('volunteers')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (!findError && existing) {
      // Update
      const { data, error } = await supabaseAdmin
        .from('volunteers')
        .update({ role, image, quote })
        .eq('id', existing.id)
        .select()
        .single();
      if (!error && data) {
        dbResult = data;
        dbSucceeded = true;
      }
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from('volunteers')
        .insert([{ name, role, image, quote }])
        .select()
        .single();
      if (!error && data) {
        dbResult = data;
        dbSucceeded = true;
      }
    }
  } catch (dbErr) {
    console.warn("Failed to sync approved volunteer to Supabase highlights:", dbErr);
  }

  // 2. Local JSON sync
  try {
    const fallbackPath = getFallbackPath('about_highlights.json');
    let currentData: any = { directors: [], volunteers: [] };
    if (fs.existsSync(fallbackPath)) {
      currentData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }

    if (!currentData.volunteers) {
      currentData.volunteers = [];
    }

    const newRecord = {
      id: dbSucceeded && dbResult ? dbResult.id : (Math.floor(Math.random() * 2000000000) + 1),
      name,
      role,
      image,
      quote
    };

    const idx = currentData.volunteers.findIndex((item: any) => item.name === name);
    if (idx !== -1) {
      currentData.volunteers[idx] = { ...currentData.volunteers[idx], ...newRecord };
    } else {
      currentData.volunteers.push(newRecord);
    }

    fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
    fs.writeFileSync(fallbackPath, JSON.stringify(currentData, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to sync approved volunteer to local highlights:", err);
  }
}

