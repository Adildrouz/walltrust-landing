import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CollectionPage from "@/models/CollectionPage";
import Testimonial from "@/models/Testimonial";
import { PLAN_LIMITS, serialize } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { PagesManager, type CollectionPageDTO } from "@/components/pages/PagesManager";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function PagesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const plan = session!.user.plan ?? "free";

  await connectDB();
  const docs = await CollectionPage.find({ userId }).sort({ createdAt: -1 }).lean();
  const counts = await Promise.all(
    docs.map((p) => Testimonial.countDocuments({ collectionPageId: p._id }))
  );

  const pages = serialize(docs).map((p, i) => ({
    ...p,
    testimonialCount: counts[i],
  })) as unknown as CollectionPageDTO[];

  const limit = PLAN_LIMITS[plan].pages;
  const atLimit = pages.length >= limit;

  return (
    <div>
      <PageHeader
        title="Collection Pages"
        description="Create shareable links where customers leave testimonials."
      />
      <div className="p-6">
        <PagesManager
          initial={pages}
          baseUrl={BASE_URL}
          atLimit={atLimit}
          limitLabel={Number.isFinite(limit) ? String(limit) : "∞"}
        />
      </div>
    </div>
  );
}
