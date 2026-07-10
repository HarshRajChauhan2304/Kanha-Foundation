import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists inside public folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate filename with timestamp to prevent overwriting
    const originalName = file.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${Date.now()}_${sanitizedName}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to local disk
    await fs.writeFile(filePath, buffer);

    // Return public relative path
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
