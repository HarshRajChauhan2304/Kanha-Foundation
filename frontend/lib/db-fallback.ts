import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

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
    // Attempt Supabase deletion
    await supabaseAdmin.from(table).delete().eq(idField, idOrKey);
  } catch (dbErr) {
    console.warn(`Supabase DB delete failed for ${table}, using local fallback:`, dbErr);
  }

  // Perform local file fallback sync
  try {
    const fallbackPath = path.join(process.cwd(), 'data', fallbackFile);
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
    const fallbackPath = path.join(process.cwd(), 'data', fallbackFile);
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
    const fallbackPath = path.join(process.cwd(), 'data', fallbackFile);
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
