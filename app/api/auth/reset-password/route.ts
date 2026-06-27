import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({
    resetPasswordToken: parsed.data.token,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // If they reset their password, treat the email as verified.
  if (!user.emailVerified) user.emailVerified = new Date();
  await user.save();

  return NextResponse.json({ message: "Password updated. You can now sign in." });
}
