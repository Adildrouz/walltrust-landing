"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Plus, ExternalLink, Pencil, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/CopyButton";
import { useToast } from "@/hooks/use-toast";

export interface CollectionPageDTO {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  questions: string[];
  allowText: boolean;
  allowPhoto: boolean;
  allowRating: boolean;
  isActive: boolean;
  testimonialCount: number;
}

interface FormState {
  title: string;
  description: string;
  questions: string[];
  allowText: boolean;
  allowPhoto: boolean;
  allowRating: boolean;
  isActive: boolean;
}

const blankForm: FormState = {
  title: "",
  description: "",
  questions: ["", "", ""],
  allowText: true,
  allowPhoto: true,
  allowRating: true,
  isActive: true,
};

export function PagesManager({
  initial,
  baseUrl,
  atLimit,
  limitLabel,
}: {
  initial: CollectionPageDTO[];
  baseUrl: string;
  atLimit: boolean;
  limitLabel: string;
}) {
  const { toast } = useToast();
  const [pages, setPages] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionPageDTO | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(blankForm);
    setOpen(true);
  }

  function openEdit(p: CollectionPageDTO) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      questions: [p.questions[0] ?? "", p.questions[1] ?? "", p.questions[2] ?? ""],
      allowText: p.allowText,
      allowPhoto: p.allowPhoto,
      allowRating: p.allowRating,
      isActive: p.isActive,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || undefined,
      questions: form.questions.map((q) => q.trim()).filter(Boolean),
      allowText: form.allowText,
      allowPhoto: form.allowPhoto,
      allowRating: form.allowRating,
      isActive: form.isActive,
    };
    try {
      const res = await fetch(
        editing ? `/api/collection-pages/${editing._id}` : "/api/collection-pages",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const saved = data.page as CollectionPageDTO;
      if (editing) {
        setPages((prev) =>
          prev.map((p) => (p._id === editing._id ? { ...p, ...saved } : p))
        );
      } else {
        setPages((prev) => [{ ...saved, testimonialCount: 0 }, ...prev]);
      }
      setOpen(false);
      toast({ description: editing ? "Page updated" : "Collection page created" });
    } catch (e) {
      toast({ description: (e as Error).message || "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: CollectionPageDTO) {
    if (!confirm(`Delete "${p.title}" and all its testimonials? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/collection-pages/${p._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPages((prev) => prev.filter((x) => x._id !== p._id));
      toast({ description: "Page deleted" });
    } catch (e) {
      toast({ description: (e as Error).message, variant: "destructive" });
    }
  }

  async function downloadQR(p: CollectionPageDTO) {
    const url = `${baseUrl}/c/${p.slug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `walltrust-${p.slug}-qr.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pages.length} / {limitLabel} pages
        </p>
        <Button onClick={openCreate} disabled={atLimit}>
          <Plus size={16} className="mr-1.5" /> New page
        </Button>
      </div>
      {atLimit && (
        <p className="text-xs text-amber-600">
          You&apos;ve reached your plan&apos;s page limit. Upgrade to add more.
        </p>
      )}

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No collection pages yet. Create one to start gathering testimonials.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((p) => {
            const link = `${baseUrl}/c/${p.slug}`;
            return (
              <Card key={p._id} data-testid="page-row" data-slug={p.slug}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" data-testid="page-title">
                        {p.title}
                      </span>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div
                      className="mt-1 truncate text-sm text-muted-foreground"
                      data-testid="page-slug"
                    >
                      /c/{p.slug}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {p.testimonialCount} testimonial{p.testimonialCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={link} label="Share" toastMessage="Link copied" />
                    <Button variant="outline" size="sm" onClick={() => downloadQR(p)}>
                      <QrCode size={15} className="mr-1.5" /> QR
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={link} target="_blank" rel="noopener">
                        <ExternalLink size={15} />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(p)}
                      data-testid="edit-page-button"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(p)}
                      data-testid="delete-page-button"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit collection page" : "New collection page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What do you think of [Your name]?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short prompt for your customers."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Guiding questions (up to 3)</Label>
              {form.questions.map((q, i) => (
                <Input
                  key={i}
                  value={q}
                  onChange={(e) => {
                    const next = [...form.questions];
                    next[i] = e.target.value;
                    setForm({ ...form, questions: next });
                  }}
                  placeholder={`Question ${i + 1}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["allowRating", "Allow star rating"],
                  ["allowText", "Allow text"],
                  ["allowPhoto", "Allow photo upload"],
                  ["isActive", "Page is active"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 accent-[hsl(var(--primary))]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || !form.title.trim()}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
