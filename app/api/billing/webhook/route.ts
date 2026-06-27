import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Lemon Squeezy variant -> plan mapping
function planForVariant(variantId: string): "starter" | "pro" | null {
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) return "starter";
  return null;
}

function verifySignature(raw: string, signature: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-signature") || "";
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  interface LSWebhook {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { id?: string; attributes?: Record<string, unknown> };
  }

  let event: LSWebhook;
  try {
    event = JSON.parse(raw) as LSWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventName = event?.meta?.event_name ?? "";
  const attrs = event?.data?.attributes ?? {};
  const subscriptionId = event?.data?.id;
  const userId = event?.meta?.custom_data?.user_id;

  await connectDB();

  // Locate the user: custom_data first, then customer id, then email.
  let user = userId ? await User.findById(userId).catch(() => null) : null;
  if (!user && attrs.customer_id) {
    user = await User.findOne({ lemonsqueezyCustomerId: String(attrs.customer_id) });
  }
  if (!user && attrs.user_email) {
    user = await User.findOne({ email: String(attrs.user_email).toLowerCase() });
  }
  if (!user) {
    // Acknowledge to avoid retries; nothing to update.
    return NextResponse.json({ received: true });
  }

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed":
    case "subscription_unpaused": {
      const plan = planForVariant(String(attrs.variant_id));
      const status = String(attrs.status ?? "");
      user.subscriptionStatus = status;
      user.lemonsqueezyCustomerId = String(attrs.customer_id);
      user.lemonsqueezySubscriptionId = subscriptionId;
      if (attrs.renews_at) user.renewalDate = new Date(String(attrs.renews_at));
      // Grant the plan while the sub is active/trialing/cancelled-but-not-yet-expired.
      if (plan && status !== "expired") user.plan = plan;
      if (status === "expired") user.plan = "free";
      break;
    }
    case "subscription_cancelled": {
      // Cancelled but typically retains access until renews_at; flag status only.
      user.subscriptionStatus = String(attrs.status || "cancelled");
      if (attrs.ends_at) user.renewalDate = new Date(String(attrs.ends_at));
      break;
    }
    case "subscription_expired":
    case "subscription_paused": {
      user.subscriptionStatus = String(attrs.status || "expired");
      user.plan = "free";
      break;
    }
    default:
      // Ignore unrelated events
      break;
  }

  await user.save();
  return NextResponse.json({ received: true });
}
