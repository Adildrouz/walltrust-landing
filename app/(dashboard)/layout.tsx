import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar
        user={{
          name: session.user.name,
          plan: session.user.plan,
          username: session.user.username,
        }}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
