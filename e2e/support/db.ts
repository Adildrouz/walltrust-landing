import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CollectionPage from "@/models/CollectionPage";
import Testimonial from "@/models/Testimonial";
import type { PlanName } from "@/lib/utils";

/**
 * Test-only DB helpers. These bypass the app's real flows (email links,
 * billing webhooks) so e2e tests don't depend on inbox access or Lemon
 * Squeezy — everything else still goes through the real HTTP API/UI.
 */

export async function verifyUserEmail(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error(`verifyUserEmail: no user found for ${email}`);
  user.emailVerified = new Date();
  user.verificationToken = undefined;
  await user.save();
}

export async function setUserPlan(email: string, plan: PlanName) {
  await connectDB();
  const res = await User.updateOne({ email: email.toLowerCase() }, { $set: { plan } });
  if (res.matchedCount === 0) throw new Error(`setUserPlan: no user found for ${email}`);
}

export async function getCollectionPageBySlug(slug: string) {
  await connectDB();
  return CollectionPage.findOne({ slug }).lean();
}

export async function countTestimonialsForPage(collectionPageId: string) {
  await connectDB();
  return Testimonial.countDocuments({ collectionPageId });
}

/** Slug of the default CollectionPage auto-created at signup (see app/api/auth/signup/route.ts). */
export async function getDefaultCollectionPageSlug(email: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) throw new Error(`getDefaultCollectionPageSlug: no user found for ${email}`);
  const page = await CollectionPage.findOne({ userId: user._id }).sort({ createdAt: 1 }).lean();
  if (!page) throw new Error(`getDefaultCollectionPageSlug: no collection page found for ${email}`);
  return page.slug;
}

export async function getTestimonialById(id: string) {
  await connectDB();
  return Testimonial.findById(id).lean();
}

export async function getUserId(email: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select("_id").lean();
  if (!user) throw new Error(`getUserId: no user found for ${email}`);
  return String(user._id);
}

export async function getUserBillingState(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("plan subscriptionStatus renewalDate lemonsqueezySubscriptionId lemonsqueezyCustomerId")
    .lean();
  if (!user) throw new Error(`getUserBillingState: no user found for ${email}`);
  return user;
}

export async function getUserPasswordHash(email: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select("passwordHash").lean();
  if (!user) throw new Error(`getUserPasswordHash: no user found for ${email}`);
  return user.passwordHash;
}

export async function getVerificationToken(email: string): Promise<string | undefined> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select("verificationToken").lean();
  if (!user) throw new Error(`getVerificationToken: no user found for ${email}`);
  return user.verificationToken;
}

export async function setUserSubscriptionId(email: string, subscriptionId: string) {
  await connectDB();
  const res = await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { lemonsqueezySubscriptionId: subscriptionId } }
  );
  if (res.matchedCount === 0) throw new Error(`setUserSubscriptionId: no user found for ${email}`);
}
