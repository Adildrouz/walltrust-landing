import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ShieldCheck } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Testimonial from "@/models/Testimonial";
import { PLAN_LIMITS, serialize, getInitials } from "@/lib/utils";
import { StarRating } from "@/components/StarRating";
import { CopyButton } from "@/components/CopyButton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function WallPage({ params }: { params: { username: string } }) {
  await connectDB();
  const user = await User.findOne({ username: params.username })
    .select("name username avatar plan")
    .lean();
  if (!user) notFound();

  const docs = await Testimonial.find({ userId: user._id, status: "approved" })
    .sort({ featured: -1, approvedAt: -1 })
    .lean();
  const testimonials = serialize(docs);

  const ratingAgg = await Testimonial.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(String(user._id)),
        status: "approved",
        rating: { $gte: 1 },
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = ratingAgg[0]?.avg ? Number(ratingAgg[0].avg).toFixed(1) : null;
  const ratedCount = ratingAgg[0]?.count ?? 0;

  const showBranding = PLAN_LIMITS[user.plan as "free" | "starter" | "pro"].hasBranding;
  const shareUrl = `${BASE_URL}/wall/${user.username}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <header className="mb-10 flex flex-col items-center text-center">
          <Avatar className="mb-4 h-16 w-16">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          {avg && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={Math.round(Number(avg))} readOnly size={20} />
              <span className="text-sm font-medium">{avg}</span>
              <span className="text-sm text-muted-foreground">· {ratedCount} reviews</span>
            </div>
          )}
          <div className="mt-5">
            <CopyButton value={shareUrl} label="Share this wall" toastMessage="Wall link copied" />
          </div>
        </header>

        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No testimonials yet.
            </CardContent>
          </Card>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {testimonials.map((t) => {
              const subtitle = [t.authorTitle, t.authorCompany].filter(Boolean).join(", ");
              return (
                <Card key={String(t._id)} className="break-inside-avoid">
                  <CardContent className="space-y-3 p-5">
                    {t.rating ? <StarRating value={t.rating} readOnly size={16} /> : null}
                    <p className="text-sm leading-relaxed text-slate-700">{t.text}</p>
                    {t.photo && (
                      <div className="relative h-44 w-full overflow-hidden rounded-md">
                        <Image
                          src={t.photo}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 320px"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 pt-1">
                      <Avatar className="h-9 w-9">
                        {t.authorAvatar && <AvatarImage src={t.authorAvatar} alt={t.authorName} />}
                        <AvatarFallback>{getInitials(t.authorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">{t.authorName}</div>
                        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showBranding && (
          <div className="mt-12 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck size={15} />
            <Link href={BASE_URL} className="hover:text-primary">
              Powered by WallTrust
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
