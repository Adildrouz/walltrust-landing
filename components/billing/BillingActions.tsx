"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UpgradeButton({
  plan,
  label,
  variant = "default",
}: {
  plan: "starter" | "pro";
  label: string;
  variant?: "default" | "outline";
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout unavailable");
      window.location.href = data.url;
    } catch (e) {
      toast({ description: (e as Error).message, variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <Button onClick={go} disabled={loading} variant={variant} className="w-full">
      {loading ? "Redirecting…" : label}
    </Button>
  );
}

export function ManageSubscriptionButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal unavailable");
      window.location.href = data.customerPortal;
    } catch (e) {
      toast({ description: (e as Error).message, variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <Button onClick={go} disabled={loading} variant="outline">
      {loading ? "Opening…" : "Manage / cancel subscription"}
    </Button>
  );
}
