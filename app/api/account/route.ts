import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CollectionPage from "@/models/CollectionPage";
import Testimonial from "@/models/Testimonial";
import WidgetConfig from "@/models/WidgetConfig";

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  notifyOnNewTestimonial: z.boolean().optional(),
});

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

  if (parsed.data.email) {
    const taken = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      _id: { $ne: session.user.id },
    });
    if (taken) {
      return NextResponse.json(
        { error: "That email is already in use." },
        { status: 409 }
      );
    }
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.email !== undefined) update.email = parsed.data.email.toLowerCase();
  if (parsed.data.notifyOnNewTestimonial !== undefined)
    update.notifyOnNewTestimonial = parsed.data.notifyOnNewTestimonial;

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: update },
    { new: true }
  ).select("name email notifyOnNewTestimonial");

  return NextResponse.json({ user });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = session.user.id;
  await Promise.all([
    Testimonial.deleteMany({ userId }),
    CollectionPage.deleteMany({ userId }),
    WidgetConfig.deleteMany({ userId }),
  ]);
  await User.findByIdAndDelete(userId);

  return NextResponse.json({ message: "Account deleted" });
}
