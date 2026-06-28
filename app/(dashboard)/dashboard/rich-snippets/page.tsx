import Link from "next/link";
import mongoose from "mongoose";
import { Star, ExternalLink, Lock } from "lucide-react";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { PLAN_LIMITS } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/CopyButton";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function RichSnippetsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const plan = session!.user.plan ?? "free";
  const username = session!.user.username;
  const hasFeature = PLAN_LIMITS[plan].hasRichSnippets;

  await connectDB();
  const agg = await Testimonial.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "approved",
        rating: { $gte: 1 },
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const count = agg[0]?.count ?? 0;
  const avg = agg[0]?.avg ? Number(agg[0].avg).toFixed(1) : "0";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: session!.user.name,
    url: `${BASE_URL}/wall/${username}`,
    ...(count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avg,
            reviewCount: count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
  const code = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;

  return (
    <div>
      <PageHeader
        title="Rich Snippets"
        description="Show your star rating directly in Google search results."
      />
      <div className="space-y-6 p-6">
        {!hasFeature ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="rounded-full bg-indigo-50 p-3">
                <Lock className="text-primary" size={26} />
              </div>
              <h3 className="text-lg font-semibold">Rich Snippets are a paid feature</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Get Google star ratings (JSON-LD) included from just $7/mo — competitors charge
                $80/mo for this.
              </p>
              <Button asChild className="mt-2">
                <Link href="/dashboard/billing">Upgrade to unlock</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:max-w-md">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground">Rated testimonials</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <Star className="fill-amber-400 text-amber-400" size={22} />
                  <div>
                    <div className="text-2xl font-semibold">{avg}</div>
                    <div className="text-xs text-muted-foreground">Average rating</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google preview mockup */}
            <div>
              <h3 className="mb-2 text-sm font-medium">How it looks in Google</h3>
              <Card>
                <CardContent className="space-y-1 p-5">
                  <div className="text-xs text-emerald-700">{BASE_URL.replace(/^https?:\/\//, "")}</div>
                  <div className="text-lg text-[#1a0dab]">{session!.user.name} — Reviews</div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i <= Math.round(Number(avg))
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }
                        />
                      ))}
                    </span>
                    <span className="font-medium">{avg}</span>
                    <span className="text-slate-400">·</span>
                    <span>{count} reviews</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    See what customers say about working with {session!.user.name}…
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Code */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Your JSON-LD code</h3>
                <CopyButton value={code} label="Copy code" toastMessage="JSON-LD copied" />
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <pre className="overflow-x-auto text-xs text-slate-100">
                  <code>{code}</code>
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <Card>
              <CardContent className="space-y-3 p-5">
                <h3 className="text-sm font-medium">How to install</h3>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  <li>Copy the code above.</li>
                  <li>
                    Paste it inside the <code className="rounded bg-slate-100 px-1">&lt;head&gt;</code> of
                    your website (or your page&apos;s SEO/custom-code section).
                  </li>
                  <li>Validate it with Google&apos;s Rich Results Test below.</li>
                </ol>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener"
                  >
                    Open Rich Results Test <ExternalLink size={14} className="ml-1.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
