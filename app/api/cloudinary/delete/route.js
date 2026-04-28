import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/** Server-only: set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in `.env.local` (Dashboard → API Keys). */
function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || "drpmjj0to";
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  cloudinary.config({ cloud_name, api_key, api_secret });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const publicId = typeof body?.publicId === "string" ? body.publicId.trim() : "";
  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({
      skipped: true,
      message:
        "Cloudinary API keys not set. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local to delete images from Cloudinary.",
    });
  }

  configureCloudinary();

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ result });
  } catch (e) {
    console.error("Cloudinary destroy:", e);
    return NextResponse.json(
      { error: e?.message || "Cloudinary delete failed" },
      { status: 500 },
    );
  }
}
