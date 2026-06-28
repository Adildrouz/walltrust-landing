import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CollectionPage from "@/models/CollectionPage";
import Testimonial from "@/models/Testimonial";

const updateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  questions: z.array(z.string().max(200)).max(3).optional(),
  allowText: z.boolean().optional(),
  allowPhoto: z.boolean().optional(),
  allowRating: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const page = await CollectionPage.findOne({
    _id: params.id,
    userId: session.user.id,
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

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

  await connectDB();
  const page = await CollectionPage.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: parsed.data },
    { new: true }
  );
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const page = await CollectionPage.findOneAndDelete({
    _id: params.id,
    userId: session.user.id,
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade: delete all testimonials for this page
  await Testimonial.deleteMany({ collectionPageId: page._id });

  return NextResponse.json({ message: "Deleted" });
}
