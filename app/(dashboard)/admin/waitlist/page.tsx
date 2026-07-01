import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import WaitlistEntry from "@/models/WaitlistEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaitlistActions } from "./WaitlistActions";

const ADMIN_EMAIL = "adil.drouz@gmail.com";

export default async function WaitlistAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  await connectDB();
  const raw = await WaitlistEntry.find({}).sort({ createdAt: -1 }).lean();

  // Serialize for client component
  const entries = raw.map((e) => ({
    _id: String(e._id),
    email: e.email,
    status: e.status,
    source: e.source,
    couponCode: e.couponCode,
    createdAt: e.createdAt.toISOString(),
  }));

  const total = entries.length;
  const pending = entries.filter((e) => e.status === "pending").length;
  const invited = entries.filter((e) => e.status === "invited").length;
  const converted = entries.filter((e) => e.status === "converted").length;

  const bySrc = entries.reduce<Record<string, number>>((acc, e) => {
    const s = e.source || "direct";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total signups</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: total },
          { label: "Pending", value: pending },
          { label: "Invited", value: invited },
          { label: "Converted", value: converted },
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

      {/* Source breakdown */}
      {Object.keys(bySrc).length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">By source</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-wrap gap-3">
            {Object.entries(bySrc).map(([src, count]) => (
              <span
                key={src}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm"
              >
                <span className="font-medium">{src}</span>
                <span className="text-muted-foreground">{count}</span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interactive table + bulk action */}
      <WaitlistActions initialEntries={entries} />
    </div>
  );
}
