"use server";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }
    // Validate file type (allow image only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Invalid file type" }, { status: 400 });
    }
    // Optional size limit (e.g., 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: "File too large (max 5MB)" }, { status: 400 });
    }
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Write to public/logo.png (overwrite existing)
    const filePath = path.join(process.cwd(), "public", "logo.png");
    fs.writeFileSync(filePath, buffer);
    return NextResponse.json({ success: true, message: "Logo updated" });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
