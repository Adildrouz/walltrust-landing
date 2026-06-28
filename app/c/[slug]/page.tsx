import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import CollectionPage from "@/models/CollectionPage";
import { serialize } from "@/lib/utils";
import {
  TestimonialForm,
  type CollectionPageConfig,
} from "@/components/testimonials/TestimonialForm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CollectPage({ params }: { params: { slug: string } }) {
  await connectDB();
  const doc = await CollectionPage.findOne({ slug: params.slug }).lean();
  if (!doc) notFound();

  const page = serialize(doc) as unknown as CollectionPageConfig & { isActive: boolean };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          {page.logo ? (
            <Image
              src={page.logo}
              alt=""
              width={64}
              height={64}
              className="mb-3 h-16 w-16 rounded-full object-cover"
            />
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
          {page.description && (
            <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            {page.isActive ? (
              <TestimonialForm page={page} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                This collection page is no longer accepting submissions.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck size={14} /> Powered by WallTrust
        </div>
      </div>
    </div>
  );
}
