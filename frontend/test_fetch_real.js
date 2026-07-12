async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/donations?t=" + Date.now(), {
      cache: "no-store"
    });
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response text:", data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
