import type { APIRequestContext } from "@playwright/test";
import { verifyUserEmail, getDefaultCollectionPageSlug, getUserId } from "./db";

export interface IndependentUser {
  name: string;
  email: string;
  password: string;
  userId: string;
  defaultPageSlug: string;
}

/**
 * Creates a fully independent account via the real signup API + direct DB
 * email verification (same bypass as the testUser fixture), WITHOUT ever
 * logging in through a `page`. Used for "User A" in cross-tenant security
 * tests (e2e/security.spec.ts), where the test's actual browser session
 * must stay logged in as a different user ("User B") throughout — if this
 * helper touched `page`'s cookies at all, it would clobber that session.
 */
export async function createIndependentUser(
  request: APIRequestContext,
  label: string
): Promise<IndependentUser> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const credentials = {
    name: `${label} Tester`,
    email: `${label.toLowerCase()}-${unique}@walltrust-e2e.test`,
    password: "TestPassword123!",
  };

  const res = await request.post("/api/auth/signup", { data: credentials });
  if (!res.ok()) {
    throw new Error(
      `createIndependentUser(${label}): signup failed (${res.status()}): ${await res.text()}`
    );
  }

  await verifyUserEmail(credentials.email);
  const [userId, defaultPageSlug] = await Promise.all([
    getUserId(credentials.email),
    getDefaultCollectionPageSlug(credentials.email),
  ]);

  return { ...credentials, userId, defaultPageSlug };
}
