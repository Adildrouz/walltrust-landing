"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TestimonialCard, type TestimonialDTO } from "./TestimonialCard";

type Status = "all" | "pending" | "approved" | "rejected";

const emptyCopy: Record<Status, string> = {
  all: "No testimonials yet. Share your collection link to start collecting.",
  pending: "Nothing waiting for review. New submissions land here.",
  approved: "No approved testimonials yet. Approve some to show them on your widget.",
  rejected: "No rejected testimonials.",
};

export function TestimonialList({ initial }: { initial: TestimonialDTO[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState<TestimonialDTO[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<Status>("all");

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...(data.testimonial as TestimonialDTO) } : t))
      );
    } catch (e) {
      toast({ description: (e as Error).message || "Action failed", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((t) => t._id !== id));
      toast({ description: "Testimonial deleted" });
    } catch (e) {
      toast({ description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    all: items.length,
    pending: items.filter((t) => t.status === "pending").length,
    approved: items.filter((t) => t.status === "approved").length,
    rejected: items.filter((t) => t.status === "rejected").length,
  };

  const filtered = tab === "all" ? items : items.filter((t) => t.status === tab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
      <TabsList>
        <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
      </TabsList>

      <TabsContent value={tab} className="mt-5">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {emptyCopy[tab]}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <TestimonialCard
                key={t._id}
                testimonial={t}
                busy={busyId === t._id}
                onApprove={(id) => patch(id, { status: "approved" })}
                onReject={(id) => patch(id, { status: "rejected" })}
                onToggleFeature={(id, featured) => patch(id, { featured })}
                onDelete={remove}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
