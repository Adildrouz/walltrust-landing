"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Entry {
  _id: string;
  email: string;
  status: "pending" | "invited" | "converted";
  source?: string;
  couponCode?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  invited: "bg-blue-100 text-blue-800",
  converted: "bg-green-100 text-green-800",
};

export function WaitlistActions({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [bulkSending, setBulkSending] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function refreshEntries() {
    const res = await fetch("/api/waitlist");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    }
  }

  async function sendLaunch(email?: string) {
    if (email) setSendingEmail(email);
    else setBulkSending(true);

    try {
      const res = await fetch("/api/waitlist/send-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          email
            ? `Launch email sent to ${email}.`
            : `Sent ${data.sent} emails (${data.failed} failed).`
        );
        await refreshEntries();
      } else {
        showToast(data.error || "Failed.");
      }
    } finally {
      setSendingEmail(null);
      setBulkSending(false);
    }
  }

  const pending = entries.filter((e) => e.status === "pending").length;

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <Button
        onClick={() => sendLaunch()}
        disabled={bulkSending || pending === 0}
        className="bg-indigo-700 hover:bg-indigo-800"
      >
        {bulkSending ? "Sending…" : `Send launch email to all pending (${pending})`}
      </Button>

      <div className="mt-6 rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wide">
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
                <td className="px-4 py-3 font-mono text-xs">{e.email}</td>
                <td className="px-4 py-3 text-slate-500">{e.source || "direct"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[e.status]}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {e.couponCode || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                  {new Date(e.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  {e.status !== "converted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sendingEmail === e.email}
                      onClick={() => sendLaunch(e.email)}
                    >
                      {sendingEmail === e.email ? "Sending…" : "Send launch email"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                  No entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
