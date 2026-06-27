import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ensureLemonSqueezy, getSubscription } from "@/lib/lemonsqueezy";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user?.lemonsqueezySubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 404 }
    );
  }

  ensureLemonSqueezy();
  const { data, error } = await getSubscription(user.lemonsqueezySubscriptionId);
  if (error || !data) {
    return NextResponse.json({ error: "Could not load subscription." }, { status: 502 });
  }

  const urls = data.data.attributes.urls;
  return NextResponse.json({
    customerPortal: urls.customer_portal,
    updatePaymentMethod: urls.update_payment_method,
  });
}
