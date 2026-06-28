import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=invalid_token`);
  }

  await connectDB();
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=invalid_token`);
  }

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  await user.save();

  return NextResponse.redirect(`${BASE_URL}/auth/login?verified=true`);
}
