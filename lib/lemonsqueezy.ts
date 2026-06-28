import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";

let configured = false;

export function ensureLemonSqueezy() {
  if (!configured) {
    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
    configured = true;
  }
}

export { createCheckout, getSubscription };

export const PLANS = {
  starter: {
    variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
    name: "Starter",
    price: 7,
  },
  pro: {
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID!,
    name: "Pro",
    price: 19,
  },
} as const;

export type PaidPlan = keyof typeof PLANS;
