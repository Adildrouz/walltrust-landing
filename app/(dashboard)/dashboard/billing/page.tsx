import { format } from "date-fns";
import { Check } from "lucide-react";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Testimonial from "@/models/Testimonial";
import CollectionPage from "@/models/CollectionPage";
import { PLAN_LIMITS, type PlanName } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UpgradeButton,
  ManageSubscriptionButton,
} from "@/components/billing/BillingActions";
import { PlanSyncOnSuccess } from "@/components/billing/PlanSyncOnSuccess";

const planMeta: Record<PlanName, { name: string; price: string; perks: string[] }> = {
  free: {
    name: "Free",
    price: "$0",
    perks: ["5 testimonials", "1 collection page", "WallTrust branding"],
  },
  starter: {
    name: "Starter",
    price: "$7/mo",
    perks: ["Unlimited testimonials", "3 collection pages", "Google Rich Snippets", "No branding"],
  },
  pro: {
    name: "Pro",
    price: "$19/mo",
    perks: ["Unlimited testimonials", "Unlimited pages", "Google Rich Snippets", "No branding"],
  },
};

function usageLabel(used: number, limit: number) {
  return `${used} / ${Number.isFinite(limit) ? limit : "∞"}`;
}

export default async function BillingPage() {
  const session = await auth();
  const userId = session!.user.id;

  await connectDB();
  const [user, testimonialCount, pageCount] = await Promise.all([
    User.findById(userId).select("plan subscriptionStatus renewalDate").lean(),
    Testimonial.countDocuments({ userId }),
    CollectionPage.countDocuments({ userId }),
  ]);

  const plan = (user?.plan ?? "free") as PlanName;
  const limits = PLAN_LIMITS[plan];
  const isPaid = plan !== "free";

  return (
    <div>
      <PlanSyncOnSuccess />
      <PageHeader title="Billing" description="Manage your plan. Cancel anytime in one click." />
      <div className="space-y-6 p-6">
        {/* Current plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Current plan</CardTitle>
            <Badge className="capitalize" data-testid="current-plan-badge">{planMeta[plan].name}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-semibold">{planMeta[plan].price}</div>
            {isPaid && user?.renewalDate && (
              <p className="text-sm text-muted-foreground">
                {user.subscriptionStatus === "cancelled" ? "Access ends" : "Renews"} on{" "}
                {format(new Date(user.renewalDate), "MMMM d, yyyy")}.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:max-w-md">
              <div className="rounded-md border border-slate-200 p-3">
                <div className="text-lg font-semibold" data-testid="testimonials-usage">
                  {usageLabel(testimonialCount, limits.testimonials)}
                </div>
                <div className="text-xs text-muted-foreground">Testimonials</div>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <div className="text-lg font-semibold">
                  {usageLabel(pageCount, limits.pages)}
                </div>
                <div className="text-xs text-muted-foreground">Collection pages</div>
              </div>
            </div>

            {isPaid && <ManageSubscriptionButton />}
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="grid gap-4 md:grid-cols-2">
          {(["starter", "pro"] as const).map((p) => {
            const meta = planMeta[p];
            const current = plan === p;
            return (
              <Card key={p} className={current ? "border-primary" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{meta.name}</CardTitle>
                  <span className="text-sm font-medium text-muted-foreground">{meta.price}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {meta.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600" /> {perk}
                      </li>
                    ))}
                  </ul>
                  {current ? (
                    <Badge variant="secondary" className="w-full justify-center py-1.5">
                      Your current plan
                    </Badge>
                  ) : (
                    <UpgradeButton
                      plan={p}
                      label={`Upgrade to ${meta.name}`}
                      variant={p === "pro" ? "outline" : "default"}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
