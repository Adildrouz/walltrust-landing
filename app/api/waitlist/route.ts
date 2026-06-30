import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WaitlistEntry from "@/models/WaitlistEntry";
import { sendWaitlistConfirmationEmail } from "@/lib/resend";

const waitlistSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    const { email, source } = parsed.data;

    await connectDB();

    const existing = await WaitlistEntry.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "You are already on the waitlist!" },
        { status: 200 }
      );
    }

    await WaitlistEntry.create({ email, source: source || "direct", status: "pending" });

    sendWaitlistConfirmationEmail(email).catch((err) =>
      console.error("Waitlist confirmation email failed:", err)
    );

    return NextResponse.json(
      { message: "You're on the list! Check your email." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Waitlist signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== "adil.drouz@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const entries = await WaitlistEntry.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ entries, count: entries.length });
}
