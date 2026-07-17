import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = {
    name: session.user.name,
    plan: session.user.plan,
    username: session.user.username,
  };

  return (
    <DashboardLayoutClient user={user} session={session}>
      {children}
    </DashboardLayoutClient>
  );
}
