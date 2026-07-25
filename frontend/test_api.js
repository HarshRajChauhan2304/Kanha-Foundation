async function run() {
  const url = "http://localhost:3000/api/volunteer";
  const body = {
    name: "Vikram Test",
    email: "vikramtest" + Math.floor(Math.random() * 100000) + "@example.com",
    phone: "+91 98765 43210",
    city: "Delhi",
    motivation: "I want to help",
    skills: ["Food Distribution & Relief Work"],
    password: "password123",
    profile_photo: "/uploads/1783404636476_harsh.png",
    gender: "Male",
    terms_accepted: true,
    aadhar_number: "999988887777",
    aadhar_upload_url: "/uploads/1783404636476_aadhar.png",
    internship_duration: "1 Month"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response:", json);
  } catch (error) {
    console.error("Error making request:", error);
  }
}
run();
