import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { serialize } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestimonialList } from "@/components/testimonials/TestimonialList";
import type { TestimonialDTO } from "@/components/testimonials/TestimonialCard";

export default async function TestimonialsPage() {
  const session = await auth();
  await connectDB();
  const docs = await Testimonial.find({ userId: session!.user.id })
    .sort({ createdAt: -1 })
    .lean();
  const testimonials = serialize(docs) as unknown as TestimonialDTO[];

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Review, approve, and feature what your customers say."
      />
      <div className="p-6">
        <TestimonialList initial={testimonials} />
      </div>
    </div>
  );
}
