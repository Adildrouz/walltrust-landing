import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import CollectionPage from "@/models/CollectionPage";
import User from "@/models/User";
import { uploadImage } from "@/lib/cloudinary";
import { sendNewTestimonialEmail } from "@/lib/resend";
import { PLAN_LIMITS } from "@/lib/utils";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

// GET — authenticated owner list, with optional filters
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const collectionPageId = searchParams.get("collectionPageId");

  const query: Record<string, unknown> = { userId: session.user.id };
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  }
  if (collectionPageId) query.collectionPageId = collectionPageId;

  await connectDB();
  const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
  return NextResponse.json({ testimonials });
}

// POST — public submission (no auth)
const submitSchema = z.object({
  slug: z.string().min(1),
  authorName: z.string().min(1).max(120),
  authorTitle: z.string().max(120).optional(),
  authorCompany: z.string().max(120).optional(),
  text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  // base64 data URIs (uploaded to Cloudinary server-side)
  photo: z.string().optional(),
  authorAvatar: z.string().optional(),
});

export async function POST(req: Request) {
  // 10 submissions per IP per 10 minutes — stops bot floods on public collection pages
  if (isRateLimited(clientIp(req), 10, 10 * 60_000, req)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    await connectDB();
    const page = await CollectionPage.findOne({ slug: data.slug });
    if (!page) {
      return NextResponse.json({ error: "Collection page not found" }, { status: 404 });
    }
    if (!page.isActive) {
      return NextResponse.json(
        { error: "This collection page is no longer accepting submissions." },
        { status: 403 }
      );
    }

    const owner = await User.findById(page.userId);
    if (!owner) {
      return NextResponse.json({ error: "Collection page not found" }, { status: 404 });
    }

    // Enforce plan testimonial cap (counts all of owner's testimonials)
    const limit = PLAN_LIMITS[owner.plan].testimonials;
    if (Number.isFinite(limit)) {
      const count = await Testimonial.countDocuments({ userId: owner._id });
      if (count >= limit) {
        return NextResponse.json(
          { error: "This page has reached its testimonial limit." },
          { status: 403 }
        );
      }
    }

    // Upload media if provided as data URIs
    let photoUrl: string | undefined;
    let avatarUrl: string | undefined;
    if (data.photo && page.allowPhoto && data.photo.startsWith("data:")) {
      photoUrl = await uploadImage(data.photo, "walltrust/photos");
    }
    if (data.authorAvatar && data.authorAvatar.startsWith("data:")) {
      avatarUrl = await uploadImage(data.authorAvatar, "walltrust/avatars");
    }

    const testimonial = await Testimonial.create({
      collectionPageId: page._id,
      userId: owner._id,
      authorName: data.authorName,
      authorTitle: data.authorTitle,
      authorCompany: data.authorCompany,
      authorAvatar: avatarUrl,
      text: data.text,
      rating: page.allowRating ? data.rating : undefined,
      photo: photoUrl,
      status: "pending",
    });

    if (owner.notifyOnNewTestimonial) {
      try {
        await sendNewTestimonialEmail(owner.email, owner.name, data.authorName, page.title);
      } catch (e) {
        console.error("Failed to send notification email:", e);
      }
    }

    return NextResponse.json(
      { message: "Thank you! Your testimonial has been submitted.", id: testimonial._id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Testimonial submit error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
