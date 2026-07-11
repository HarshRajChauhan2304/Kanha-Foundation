import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    // Generate filename with timestamp to prevent overwriting
    const originalName = file.name || 'file';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${Date.now()}_${sanitizedName}`;

    // Attempt 1: Upload to Supabase Storage (preferred for production/serverless)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Ensure bucket exists
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketName = 'uploads';
        const bucketExists = buckets?.some(b => b.name === bucketName);

        if (!bucketExists) {
          await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
        }

        // Upload file
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        if (uploadData) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
          }
        }
      }
    } catch (supabaseError: any) {
      console.warn("Supabase storage upload failed, attempting local fallback:", supabaseError.message || supabaseError);
    }

    // Attempt 2: Write to local disk (fallback for local development)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: fileUrl });
    } catch (localError: any) {
      console.warn("Local storage upload failed, attempting Base64 fallback:", localError.message || localError);
      
      // Attempt 3: Base64 data URL (failsafe fallback for EROFS serverless without working Supabase storage)
      const base64Data = buffer.toString('base64');
      const mimeType = file.type || 'application/octet-stream';
      const base64Url = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({ success: true, url: base64Url, warning: "Uploaded as base64 fallback" });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
