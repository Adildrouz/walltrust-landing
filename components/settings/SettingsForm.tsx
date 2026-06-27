"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SettingsForm({
  initial,
}: {
  initial: { name: string; email: string; notifyOnNewTestimonial: boolean };
}) {
  const { toast } = useToast();
  const [profile, setProfile] = useState(initial);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  const [deleting, setDeleting] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ description: "Settings saved" });
    } catch (e) {
      toast({ description: (e as Error).message || "Save failed", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPw(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPw({ currentPassword: "", newPassword: "" });
      toast({ description: "Password updated" });
    } catch (e) {
      toast({ description: (e as Error).message || "Update failed", variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account, pages, and all testimonials? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await signOut({ callbackUrl: "/" });
    } catch (e) {
      toast({ description: (e as Error).message, variant: "destructive" });
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.notifyOnNewTestimonial}
              onChange={(e) =>
                setProfile({ ...profile, notifyOnNewTestimonial: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 accent-[hsl(var(--primary))]"
            />
            Email me when a new testimonial is submitted
          </label>
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              autoComplete="current-password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              autoComplete="new-password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </div>
          <Button
            onClick={changePassword}
            disabled={savingPw || !pw.currentPassword || pw.newPassword.length < 8}
          >
            {savingPw ? "Updating…" : "Update password"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Delete your account and all associated data.
          </p>
          <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
