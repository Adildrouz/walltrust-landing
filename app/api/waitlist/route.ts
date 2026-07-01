import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WaitlistEntry from "@/models/WaitlistEntry";
import { sendWaitlistConfirmationEmail } from "@/lib/resend";

const waitlistSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(50).optional(),
});

// In-memory rate limiter: max 3 submissions per IP per minute.
// Per-instance only (serverless), but stops the vast majority of naive bots.
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 3;
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < window);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 2000) {
    ipHits.forEach((v, k) => {
      if (v.every((t) => now - t > window)) ipHits.delete(k);
    });
  }
  return hits.length > max;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
