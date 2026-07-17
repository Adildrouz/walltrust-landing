import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription as getSubscriptionReal,
} from "@lemonsqueezy/lemonsqueezy.js";

let configured = false;

export function ensureLemonSqueezy() {
  if (!configured) {
    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
    configured = true;
  }
}

export { createCheckout };

// getSubscription() looks up a real, existing Lemon Squeezy subscription.
// There's no way for e2e tests to have one — checkout creation doesn't
// create a subscription, only a real completed hosted checkout does, and
// that's explicitly out of scope for the automated suite. Same
// PLAYWRIGHT_TEST gate as lib/cloudinary.ts / lib/resend.ts /
// lib/rate-limit.ts: stub the response shape instead of depending on a
// subscription that can't exist in this environment.
const TEST_MODE = process.env.PLAYWRIGHT_TEST === "1";

interface SubscriptionResult {
  data: {
    data: {
      id: string;
      attributes: { urls: { customer_portal: string; update_payment_method: string } };
    };
  } | null;
  error: Error | null;
}

export async function getSubscription(subscriptionId: string): Promise<SubscriptionResult> {
  if (TEST_MODE) {
    return {
      data: {
        data: {
          id: subscriptionId,
          attributes: {
            urls: {
              customer_portal: `https://walltrust-test.lemonsqueezy.com/billing?expires=test-mode`,
              update_payment_method: `https://walltrust-test.lemonsqueezy.com/subscription/${subscriptionId}/payment-details?expires=test-mode`,
            },
          },
        },
      },
      error: null,
    };
  }
  return getSubscriptionReal(subscriptionId) as unknown as Promise<SubscriptionResult>;
}

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
