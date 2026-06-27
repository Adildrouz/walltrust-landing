import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import WidgetConfig from "@/models/WidgetConfig";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Params = { params: { userId: string } };

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(_req: Request, { params }: Params) {
  await connectDB();

  const config = await WidgetConfig.findOne({ userId: params.userId });
  const minRating = config?.filterMinRating ?? 1;
  const maxItems = config?.maxItems ?? 6;

  const query: Record<string, unknown> = {
    userId: params.userId,
    status: "approved",
  };
  // Only filter by rating when a meaningful floor is set (allows text-only testimonials through at minRating 1)
  if (minRating > 1) query.rating = { $gte: minRating };

  const testimonials = await Testimonial.find(query)
    .sort({ featured: -1, approvedAt: -1 })
    .limit(maxItems)
    .select("authorName authorTitle authorCompany authorAvatar text rating photo featured approvedAt")
    .lean();

  return NextResponse.json(
    {
      testimonials,
      config: config
        ? {
            style: config.style,
            colorBg: config.colorBg,
            colorText: config.colorText,
            colorAccent: config.colorAccent,
            showRating: config.showRating,
            showAvatar: config.showAvatar,
          }
        : null,
    },
    { headers: CORS }
  );
}
