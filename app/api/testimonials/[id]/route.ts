import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";

const updateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  featured: z.boolean().optional(),
  authorName: z.string().min(1).max(120).optional(),
  authorTitle: z.string().max(120).optional(),
  authorCompany: z.string().max(120).optional(),
  text: z.string().min(1).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "approved") update.approvedAt = new Date();

  await connectDB();
  const testimonial = await Testimonial.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: update },
    { new: true }
  );
  if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const testimonial = await Testimonial.findOneAndDelete({
    _id: params.id,
    userId: session.user.id,
  });
  if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
