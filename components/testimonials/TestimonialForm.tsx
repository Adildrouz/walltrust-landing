"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";

export interface CollectionPageConfig {
  slug: string;
  title: string;
  description?: string;
  logo?: string;
  questions: string[];
  allowText: boolean;
  allowPhoto: boolean;
  allowRating: boolean;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TestimonialForm({ page }: { page: CollectionPageConfig }) {
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, kind: "photo" | "avatar") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    if (kind === "photo") setPhoto(dataUrl);
    else setAvatar(dataUrl);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!authorName.trim()) return setError("Please enter your name.");
    if (page.allowText && !text.trim()) return setError("Please write a short testimonial.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: page.slug,
          authorName,
          authorTitle: authorTitle || undefined,
          authorCompany: authorCompany || undefined,
          text: text || " ",
          rating: page.allowRating && rating ? rating : undefined,
          photo: page.allowPhoto && photo ? photo : undefined,
          authorAvatar: avatar || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="rounded-full bg-emerald-50 p-3">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold">Thank you! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Your testimonial has been submitted and is awaiting review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {page.questions.length > 0 && (
        <ul className="space-y-1 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
          {page.questions.map((q, i) => (
            <li key={i}>• {q}</li>
          ))}
        </ul>
      )}

      {page.allowRating && (
        <div className="space-y-1.5">
          <Label>Your rating</Label>
          <StarRating value={rating} onChange={setRating} size={28} />
        </div>
      )}

      {page.allowText && (
        <div className="space-y-1.5">
          <Label htmlFor="text">Your testimonial</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Share your experience…"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title / role</Label>
          <Input id="title" value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="company">Company (optional)</Label>
        <Input id="company" value={authorCompany} onChange={(e) => setAuthorCompany(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageField
          label="Your photo (optional)"
          value={avatar}
          onChange={(e) => handleFile(e, "avatar")}
          onClear={() => setAvatar("")}
        />
        {page.allowPhoto && (
          <ImageField
            label="Attach an image (optional)"
            value={photo}
            onChange={(e) => handleFile(e, "photo")}
            onClear={() => setPhoto("")}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit testimonial"}
      </Button>
    </form>
  );
}

function ImageField({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-20 w-20 rounded-md object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="flex h-20 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 hover:bg-slate-50">
          <ImagePlus size={16} /> Upload
          <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
      )}
    </div>
  );
}
