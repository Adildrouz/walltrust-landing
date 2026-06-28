import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CollectionPage from "@/models/CollectionPage";
import User from "@/models/User";
import { PLAN_LIMITS, generateSlug } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  questions: z.array(z.string().max(200)).max(3).optional(),
  allowText: z.boolean().optional(),
  allowPhoto: z.boolean().optional(),
  allowRating: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const pages = await CollectionPage.find({ userId: session.user.id }).sort({
    createdAt: -1,
  });
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = PLAN_LIMITS[user.plan].pages;
  const count = await CollectionPage.countDocuments({ userId: user._id });
  if (count >= limit) {
    return NextResponse.json(
      {
        error: `Your ${user.plan} plan allows ${limit} collection page${
          limit === 1 ? "" : "s"
        }. Upgrade to add more.`,
      },
      { status: 403 }
    );
  }

  // Ensure unique slug
  let slug = generateSlug(parsed.data.title);
  while (await CollectionPage.exists({ slug })) {
    slug = generateSlug(parsed.data.title);
  }

  const page = await CollectionPage.create({
    userId: user._id,
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    questions: parsed.data.questions,
    allowText: parsed.data.allowText,
    allowPhoto: parsed.data.allowPhoto,
    allowRating: parsed.data.allowRating,
  });

  return NextResponse.json({ page }, { status: 201 });
}
