import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  await connectDB();
  const user = await User.findById(session!.user.id)
    .select("name email notifyOnNewTestimonial")
    .lean();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <div className="p-6">
        <SettingsForm
          initial={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            notifyOnNewTestimonial: user?.notifyOnNewTestimonial ?? true,
          }}
        />
      </div>
    </div>
  );
}
