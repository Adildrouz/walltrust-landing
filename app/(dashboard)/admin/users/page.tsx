import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_EMAIL = "adil.drouz@gmail.com";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-800",
  starter: "bg-blue-100 text-blue-800",
  pro: "bg-purple-100 text-purple-800",
};

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  await connectDB();
  const raw = await User.find({}, { email: 1, createdAt: 1, emailVerified: 1, plan: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const users = raw.map((u) => ({
    _id: String(u._id),
    email: u.email,
    createdAt: u.createdAt.toISOString(),
    emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
    plan: u.plan || "free",
  }));

  const total = users.length;
  const verified = users.filter((u) => u.emailVerified).length;
  const unverified = total - verified;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{total} total accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: total },
          { label: "Verified", value: verified },
          { label: "Unverified", value: unverified },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Email verified</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      PLAN_COLORS[u.plan] || PLAN_COLORS.free
                    }`}
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.emailVerified ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                  {new Date(u.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
