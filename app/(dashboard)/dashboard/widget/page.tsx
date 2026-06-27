import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WidgetConfig from "@/models/WidgetConfig";
import Testimonial from "@/models/Testimonial";
import { serialize } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { WidgetConfigurator } from "@/components/widget/WidgetConfigurator";
import type {
  WidgetConfigDTO,
  PreviewTestimonial,
} from "@/components/widget/WidgetPreview";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function WidgetPage() {
  const session = await auth();
  const userId = session!.user.id;

  await connectDB();
  let config = await WidgetConfig.findOne({ userId }).lean();
  if (!config) {
    const created = await WidgetConfig.create({ userId });
    config = created.toObject();
  }

  const docs = await Testimonial.find({ userId, status: "approved" })
    .sort({ featured: -1, approvedAt: -1 })
    .limit(20)
    .lean();

  const c = serialize(config);
  const initialConfig: WidgetConfigDTO = {
    style: c.style,
    colorBg: c.colorBg,
    colorText: c.colorText,
    colorAccent: c.colorAccent,
    showRating: c.showRating,
    showAvatar: c.showAvatar,
    maxItems: c.maxItems,
    filterMinRating: c.filterMinRating,
  };

  const testimonials = serialize(docs) as unknown as PreviewTestimonial[];

  return (
    <div>
      <PageHeader
        title="Widget"
        description="Style your wall of love and grab the one-line embed code."
      />
      <div className="p-6">
        <WidgetConfigurator
          initialConfig={initialConfig}
          testimonials={testimonials}
          userId={userId}
          baseUrl={BASE_URL}
        />
      </div>
    </div>
  );
}
