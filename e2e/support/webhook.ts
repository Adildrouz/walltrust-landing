import crypto from "crypto";

/**
 * Signs a raw Lemon Squeezy webhook payload with the real
 * LEMONSQUEEZY_WEBHOOK_SECRET from .env.local (loaded into the Playwright
 * process by loadEnvConfig() in playwright.config.ts) — the exact secret
 * app/api/billing/webhook/route.ts verifies against via
 * crypto.timingSafeEqual(). Signing with a placeholder secret would only
 * prove the test's own HMAC math is self-consistent, not that the real
 * endpoint actually rejects unsigned/invalid requests.
 */
export function signWebhookPayload(rawBody: string): string {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "LEMONSQUEEZY_WEBHOOK_SECRET is not set in the test environment — required to sign webhook test payloads with the real secret."
    );
  }
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

/** Builds a minimal Lemon Squeezy subscription webhook body, matching the shape app/api/billing/webhook/route.ts parses. */
export function lemonSqueezyWebhookPayload(opts: {
  eventName: string;
  userId: string;
  subscriptionId: string;
  variantId?: string;
  status?: string;
  customerId?: string;
  renewsAt?: string;
  endsAt?: string;
}): string {
  const attributes: Record<string, unknown> = {
    status: opts.status ?? "active",
    customer_id: opts.customerId ?? "test-customer-1",
  };
  if (opts.variantId) attributes.variant_id = opts.variantId;
  if (opts.renewsAt) attributes.renews_at = opts.renewsAt;
  if (opts.endsAt) attributes.ends_at = opts.endsAt;

  return JSON.stringify({
    meta: {
      event_name: opts.eventName,
      custom_data: { user_id: opts.userId },
    },
    data: {
      id: opts.subscriptionId,
      attributes,
    },
  });
}
