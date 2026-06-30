"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_EMAIL = "adil.drouz@gmail.com";

interface WaitlistEntry {
  _id: string;
  email: string;
  status: "pending" | "invited" | "converted";
  source?: string;
  couponCode?: string;
  createdAt: string;
  invitedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  invited: "bg-blue-100 text-blue-800",
  converted: "bg-green-100 text-green-800",
};

export default function WaitlistAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkSending, setBulkSending] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.email !== ADMIN_EMAIL)) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (res.ok) setEntries(data.entries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email === ADMIN_EMAIL) {
      load();
    }
  }, [status, session, load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function sendLaunch(email?: string) {
    const isBulk = !email;
    if (isBulk) setBulkSending(true);
    else setSendingId(email ?? null);
    try {
      const res = await fetch("/api/waitlist/send-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isBulk
          ? `Sent ${data.sent} launch emails (${data.failed} failed).`
          : `Launch email sent to ${email}.`
        );
        await load();
      } else {
        showToast(data.error || "Failed to send.");
      }
    } finally {
      if (isBulk) setBulkSending(false);
      else setSendingId(null);
    }
  }

  if (status === "loading" || (status === "authenticated" && session?.user?.email !== ADMIN_EMAIL)) {
    return null;
  }

  // Stats
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
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total signups</p>
        </div>
        <Button
          onClick={() => sendLaunch()}
          disabled={bulkSending || pending === 0}
          className="bg-indigo-700 hover:bg-indigo-800"
        >
          {bulkSending ? "Sending…" : `Send launch email to all pending (${pending})`}
        </Button>
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
              <span key={src} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm">
                <span className="font-medium">{src}</span>
                <span className="text-muted-foreground">{count}</span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No entries yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Coupon</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono">{e.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.source || "direct"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {e.couponCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {e.status !== "converted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={sendingId === e.email}
                          onClick={() => sendLaunch(e.email)}
                        >
                          {sendingId === e.email ? "Sending…" : "Send launch email"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
