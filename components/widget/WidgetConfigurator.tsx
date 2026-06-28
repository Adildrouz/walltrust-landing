"use client";

import { useState } from "react";
import { Grid3x3, GalleryHorizontal, Square, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/CopyButton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  WidgetPreview,
  type WidgetConfigDTO,
  type PreviewTestimonial,
} from "./WidgetPreview";

const styles = [
  { key: "grid", label: "Grid", icon: Grid3x3 },
  { key: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { key: "single", label: "Single", icon: Square },
  { key: "badge", label: "Badge", icon: BadgeCheck },
] as const;

export function WidgetConfigurator({
  initialConfig,
  testimonials,
  userId,
  baseUrl,
}: {
  initialConfig: WidgetConfigDTO;
  testimonials: PreviewTestimonial[];
  userId: string;
  baseUrl: string;
}) {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<WidgetConfigDTO>(initialConfig);
  const [saving, setSaving] = useState(false);

  const embed = `<div id="walltrust-widget"></div>\n<script src="${baseUrl}/api/widget/${userId}" async></script>`;

  function set<K extends keyof WidgetConfigDTO>(key: K, value: WidgetConfigDTO[K]) {
    setCfg((c) => ({ ...c, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/widget-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast({ description: "Widget settings saved" });
    } catch (e) {
      toast({ description: (e as Error).message || "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <Card className="h-fit">
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Label>Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.key}
                  onClick={() => set("style", s.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition-colors",
                    cfg.style === s.key
                      ? "border-primary bg-indigo-50 text-primary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <s.icon size={18} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["colorBg", "Background"],
                ["colorText", "Text"],
                ["colorAccent", "Accent"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <input
                  type="color"
                  value={cfg[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-md border border-slate-200"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {(
              [
                ["showRating", "Show rating"],
                ["showAvatar", "Show avatar"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cfg[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[hsl(var(--primary))]"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Max items</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={cfg.maxItems}
                onChange={(e) => set("maxItems", Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Min rating</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={cfg.filterMinRating}
                onChange={(e) =>
                  set("filterMinRating", Math.min(5, Math.max(1, Number(e.target.value) || 1)))
                }
              />
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview + embed */}
      <div className="space-y-5">
        <div>
          <h3 className="mb-3 text-sm font-medium">Live preview</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <WidgetPreview config={cfg} testimonials={testimonials} />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Embed code</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Paste this where you want the wall to appear. One line, no dependencies.
          </p>
          <div className="rounded-lg bg-slate-900 p-4">
            <pre className="overflow-x-auto text-xs text-slate-100">
              <code>{embed}</code>
            </pre>
          </div>
          <div className="mt-3">
            <CopyButton value={embed} label="Copy embed code" toastMessage="Embed code copied" />
          </div>
        </div>
      </div>
    </div>
  );
}
