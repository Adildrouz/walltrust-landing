import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/resend";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  // Always return a generic success to avoid leaking which emails exist.
  const generic = NextResponse.json({
    message: "If an account exists for that email, we've sent reset instructions.",
  });
  if (!parsed.success) return generic;

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) return generic;

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }
  return generic;
}
