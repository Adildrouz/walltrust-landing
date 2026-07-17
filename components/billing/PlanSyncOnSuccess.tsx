"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Renders nothing — exists purely to fix the JWT plan-staleness bug: a user
 * who just upgraded has their DB `plan` updated correctly by the Lemon
 * Squeezy webhook, but their existing session's JWT still carries the old
 * plan (see auth.ts's jwt callback) until something re-runs it.
 *
 * app/api/billing/checkout/route.ts sets the post-checkout redirect target
 * to /dashboard/billing?success=true. On landing here, this calls
 * useSession().update() (re-runs the jwt callback with trigger: "update",
 * which re-fetches the fresh plan from the DB and re-signs the session
 * cookie), then router.refresh() so the already-rendered server components
 * on this page (and the sidebar) pick up the new plan on the SAME page
 * load — no manual logout/login needed, which is exactly what was broken.
 */
export function PlanSyncOnSuccess() {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (searchParams.get("success") !== "true" || hasSynced.current) return;
    hasSynced.current = true;

    (async () => {
      // Calling update() with NO argument sends a GET to /api/auth/session
      // (next-auth/react's fetchData only switches to POST when req.body is
      // truthy — see node_modules/next-auth/lib/client.js), and the server
      // only treats POST as an update trigger (@auth/core/index.js checks
      // request.method === "POST" before setting isUpdate, which is what
      // becomes trigger: "update" in auth.ts's jwt callback). A bare
      // update() therefore silently no-ops the whole refresh — passing any
      // truthy value forces the POST path that actually re-runs the
      // callback and re-signs the cookie.
      await update({ requestedAt: Date.now() });
      router.refresh();
      // Clean the URL so a manual reload of this same link doesn't re-sync
      // on every visit — router.replace avoids adding a new history entry.
      router.replace("/dashboard/billing");
    })();
  }, [searchParams, update, router]);

  return null;
}
