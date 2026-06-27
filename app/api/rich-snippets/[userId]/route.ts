import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import User from "@/models/User";
import { PLAN_LIMITS } from "@/lib/utils";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

type Params = { params: { userId: string } };

export async function GET(_req: Request, { params }: Params) {
  await connectDB();

  const user = await User.findById(params.userId).select("name username plan");
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Rich Snippets are a paid feature
  if (!PLAN_LIMITS[user.plan].hasRichSnippets) {
    return NextResponse.json(
      { error: "Rich Snippets are available on paid plans." },
      { status: 403 }
    );
  }

  const testimonials = await Testimonial.find({
    userId: params.userId,
    status: "approved",
    rating: { $gte: 1 },
  })
    .select("authorName text rating approvedAt")
    .lean();

  const reviewCount = testimonials.length;
  const ratingValue =
    reviewCount > 0
      ? (
          testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / reviewCount
        ).toFixed(1)
      : "0";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: user.name,
    url: `${BASE_URL}/wall/${user.username}`,
  };

  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
    jsonLd.review = testimonials.slice(0, 10).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.authorName },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(t.rating),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: t.text,
      ...(t.approvedAt ? { datePublished: new Date(t.approvedAt).toISOString().slice(0, 10) } : {}),
    }));
  }

  return new NextResponse(JSON.stringify(jsonLd, null, 2), {
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
