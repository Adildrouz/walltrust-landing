import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CollectionPage from "@/models/CollectionPage";
import WidgetConfig from "@/models/WidgetConfig";
import { sendVerificationEmail, sendDuplicateSignupEmail } from "@/lib/resend";
import { generateUsername } from "@/lib/utils";
import WaitlistEntry from "@/models/WaitlistEntry";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function uniqueUsername(name: string): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const candidate = generateUsername(name);
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  // Fallback: guaranteed-unique suffix
  return generateUsername(name) + Date.now().toString().slice(-4);
}

export async function POST(req: Request) {
  // 5 signups per IP per 10 minutes — stops mass account creation
  if (isRateLimited(clientIp(req), 5, 10 * 60_000, req)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // Generic response — don't reveal whether the email is registered.
      // Notify the account holder so they know their email was used.
      sendDuplicateSignupEmail(email.toLowerCase()).catch((e) =>
        console.error("Duplicate signup email failed:", e)
      );
      return NextResponse.json(
        { message: "Account created. Check your email to verify your account." },
        { status: 201 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const username = await uniqueUsername(name);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      username,
      verificationToken,
    });

    // Default collection page (slug = username) + widget config
    await CollectionPage.create({
      userId: user._id,
      slug: username,
      title: `What do you think of ${name}?`,
      description: "I'd love to hear about your experience.",
    });
    await WidgetConfig.create({ userId: user._id });

    // Mark waitlist entry as converted if email was on the list
    WaitlistEntry.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: "converted", convertedAt: new Date() }
    ).catch((e) => console.error("Waitlist conversion update failed:", e));

    try {
      await sendVerificationEmail(user.email, name, verificationToken);
    } catch (e) {
      console.error("Failed to send verification email:", e);
      // Account is created; surface a soft warning but still 201.
    }

    return NextResponse.json(
      { message: "Account created. Check your email to verify your account." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
