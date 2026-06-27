import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const testimonial = await Testimonial.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: { status: "approved", approvedAt: new Date() } },
    { new: true }
  );
  if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}
