import Link from "next/link";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import CollectionPage from "@/models/CollectionPage";
import { PLAN_LIMITS, serialize } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { UpgradeBanner } from "@/components/billing/UpgradeBanner";
import { CopyButton } from "@/components/CopyButton";
import { StarRating } from "@/components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, Clock, Gauge } from "lucide-react";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const plan = session!.user.plan ?? "free";

  await connectDB();
  const [total, approved, pending, ratingAgg, recentRaw, firstPage] = await Promise.all([
    Testimonial.countDocuments({ userId }),
    Testimonial.countDocuments({ userId, status: "approved" }),
    Testimonial.countDocuments({ userId, status: "pending" }),
    Testimonial.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "approved", rating: { $gte: 1 } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]).then((res) => res[0]?.avg ?? 0),
    Testimonial.find({ userId }).sort({ status: 1, createdAt: -1 }).limit(5).lean(),
    CollectionPage.findOne({ userId }).sort({ createdAt: 1 }).lean(),
  ]);

  const recent = serialize(recentRaw);
  const avgRating = ratingAgg ? Number(ratingAgg).toFixed(1) : "—";
  const shareLink = firstPage ? `${BASE_URL}/c/${firstPage.slug}` : "";
  const widgetCode = `<div id="walltrust-widget"></div>\n<script src="${BASE_URL}/api/widget/${userId}" async></script>`;

  const limit = PLAN_LIMITS[plan].testimonials;
  const nearLimit = Number.isFinite(limit) && total >= Number(limit) - 1;

  const stats = [
    { label: "Total", value: total, icon: Star, color: "text-slate-700" },
    { label: "Approved", value: approved, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-500" },
    { label: "Avg. rating", value: avgRating, icon: Gauge, color: "text-primary" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session!.user.name?.split(" ")[0] ?? ""}`}
        description="Here's what's happening with your testimonials."
      />
      <div className="space-y-6 p-6">
        {plan === "free" && nearLimit && (
          <UpgradeBanner message={`You've used ${total} of ${limit} testimonials on the Free plan. Upgrade for unlimited.`} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={s.color} size={22} />
                <div>
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium">Quick actions</h3>
              <p className="text-sm text-muted-foreground">
                Share your collection link or embed your widget.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {shareLink && (
                <CopyButton value={shareLink} label="Share collection link" toastMessage="Collection link copied" />
              )}
              <CopyButton value={widgetCode} label="Copy widget code" toastMessage="Widget code copied" />
            </div>
          </CardContent>
        </Card>

        {/* Recent */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Recent testimonials</h3>
            <Link href="/dashboard/testimonials" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No testimonials yet. Share your collection link to start collecting.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <Card key={String(t._id)}>
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.authorName}</span>
                        {t.rating ? <StarRating value={t.rating} readOnly size={14} /> : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.text}</p>
                    </div>
                    <Badge
                      variant={
                        t.status === "approved"
                          ? "default"
                          : t.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="shrink-0 capitalize"
                    >
                      {t.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
