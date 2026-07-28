import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided." }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename with timestamp to prevent overwriting
    const originalName = file.name || 'file.jpg';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${Date.now()}_${sanitizedName}`;

    // Determine correct content type
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else contentType = 'image/jpeg';
    }

    // Attempt 1: Upload to Supabase Storage
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const bucketName = 'uploads';
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType,
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json(
              { success: true, url: publicUrlData.publicUrl },
              { headers: corsHeaders }
            );
          }
        } else if (uploadError) {
          console.warn("Supabase storage upload error:", uploadError.message || uploadError);
        }
      }
    } catch (supabaseError: any) {
      console.warn("Supabase storage exception:", supabaseError.message || supabaseError);
    }

    // Attempt 2: Base64 data URL fallback (Instant, works everywhere, no server reload)
    const base64Data = buffer.toString('base64');
    const base64Url = `data:${contentType};base64,${base64Data}`;
    return NextResponse.json(
      { success: true, url: base64Url },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
