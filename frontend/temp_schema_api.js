async function run() {
  const url = "https://cwpfhfcxpeqiihiqxqtu.supabase.co/rest/v1/";
  const headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cGZoZmN4cGVxaWloaXF4cXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1ODQ2NSwiZXhwIjoyMDk4NjM0NDY1fQ.7Wrh-UUcFSe7fMmCMYeySPOtEnH-Lew-CV-MWI8reDA"
  };

  try {
    const res = await fetch(url, { headers });
    const schema = await res.json();
    console.log("=== TABLES ===");
    console.log("Table definitions list:", Object.keys(schema.definitions || {}));
    
    if (schema.definitions) {
      for (const tableName of Object.keys(schema.definitions)) {
        console.log(`\n=== ${tableName} columns ===`);
        console.log(Object.keys(schema.definitions[tableName].properties || {}));
      }
    }
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

run();
