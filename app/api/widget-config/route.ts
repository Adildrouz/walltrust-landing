import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WidgetConfig from "@/models/WidgetConfig";

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color");

const patchSchema = z.object({
  style: z.enum(["grid", "carousel", "single", "badge"]).optional(),
  colorBg: hex.optional(),
  colorText: hex.optional(),
  colorAccent: hex.optional(),
  showRating: z.boolean().optional(),
  showAvatar: z.boolean().optional(),
  maxItems: z.number().int().min(1).max(50).optional(),
  filterMinRating: z.number().int().min(1).max(5).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  let config = await WidgetConfig.findOne({ userId: session.user.id });
  if (!config) config = await WidgetConfig.create({ userId: session.user.id });
  return NextResponse.json({ config });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const config = await WidgetConfig.findOneAndUpdate(
    { userId: session.user.id },
    { $set: parsed.data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ config });
}
