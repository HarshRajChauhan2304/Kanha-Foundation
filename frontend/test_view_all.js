const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://cwpfhfcxpeqiihiqxqtu.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cGZoZmN4cGVxaWloaXF4cXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1ODQ2NSwiZXhwIjoyMDk4NjM0NDY1fQ.7Wrh-UUcFSe7fMmCMYeySPOtEnH-Lew-CV-MWI8reDA";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase.from('donations').select('*');
  console.log("Error:", error);
  console.log("Rows:", data);
}

run();
