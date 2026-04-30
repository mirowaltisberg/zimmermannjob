import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const jobId = formData.get("jobId") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const cv = formData.get("cv") as File | null;

    if (!jobId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "jobId, name, email, and phone are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let cvPath: string | null = null;
    let cvFilename: string | null = null;

    if (cv && cv.size > 0) {
      // Validate file size (10 MB)
      if (cv.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "CV file must be under 10 MB" },
          { status: 400 }
        );
      }

      // Validate MIME type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(cv.type)) {
        return NextResponse.json(
          { error: "CV must be a PDF or DOCX file" },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const safeName = cv.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      cvPath = `${jobId}/${timestamp}-${safeName}`;
      cvFilename = cv.name;

      const buffer = Buffer.from(await cv.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(cvPath, buffer, { contentType: cv.type });

      if (uploadError) {
        console.error("CV upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload CV" },
          { status: 500 }
        );
      }
    }

    const { error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        name,
        email,
        phone,
        cv_path: cvPath,
        cv_filename: cvFilename,
      });

    if (insertError) {
      console.error("Application insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 }
      );
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
