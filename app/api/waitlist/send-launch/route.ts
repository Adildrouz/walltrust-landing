import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WaitlistEntry from "@/models/WaitlistEntry";
import { sendWaitlistLaunchEmail } from "@/lib/resend";

function generateCoupon(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WAIT-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== "adil.drouz@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawEmail: unknown = body?.email;
  const targetEmail: string | undefined =
    typeof rawEmail === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
      ? rawEmail.toLowerCase().trim()
      : undefined;

  await connectDB();

  // If a specific email is provided, send only to that one (regardless of status).
  // Otherwise, bulk-send to all pending entries.
  const filter = targetEmail ? { email: targetEmail } : { status: "pending" };
  const entries = await WaitlistEntry.find(filter);

  let sent = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const coupon = generateCoupon();
      await sendWaitlistLaunchEmail(entry.email, coupon);
      entry.status = "invited";
      entry.couponCode = coupon;
      entry.invitedAt = new Date();
      await entry.save();
      sent++;
    } catch (err) {
      console.error(`Failed to email ${entry.email}:`, err);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({ sent, failed, total: entries.length });
}
