import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/cloudinary";

const bodySchema = z.object({
  file: z.string().startsWith("data:", "Expected a base64 data URI"),
  folder: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_API_KEY) {
    return NextResponse.json(
      { error: "Image uploads are not configured yet." },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid file" },
      { status: 400 }
    );
  }

  try {
    const url = await uploadImage(parsed.data.file, parsed.data.folder ?? "walltrust");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
