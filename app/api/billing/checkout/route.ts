import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ensureLemonSqueezy, createCheckout, PLANS } from "@/lib/lemonsqueezy";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const bodySchema = z.object({ plan: z.enum(["starter", "pro"]) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = PLANS[parsed.data.plan].variantId;
  if (!storeId || !variantId) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 }
    );
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  ensureLemonSqueezy();
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      name: user.name,
      custom: { user_id: user._id.toString() },
    },
    productOptions: {
      redirectUrl: `${BASE_URL}/dashboard/billing?success=true`,
    },
  });

  if (error || !data) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: data.data.attributes.url });
}
