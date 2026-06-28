"use client";

import { Star } from "lucide-react";

export interface PreviewTestimonial {
  _id: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatar?: string;
  text: string;
  rating?: number;
  photo?: string;
}

export interface WidgetConfigDTO {
  style: "grid" | "carousel" | "single" | "badge";
  colorBg: string;
  colorText: string;
  colorAccent: string;
  showRating: boolean;
  showAvatar: boolean;
  maxItems: number;
  filterMinRating: number;
}

function Stars({ n, accent }: { n: number; accent: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={15}
          style={{ color: i <= n ? accent : "rgba(15,23,42,0.18)" }}
          fill={i <= n ? accent : "transparent"}
        />
      ))}
    </div>
  );
}

function Card({
  t,
  cfg,
}: {
  t: PreviewTestimonial;
  cfg: WidgetConfigDTO;
}) {
  const subtitle = [t.authorTitle, t.authorCompany].filter(Boolean).join(", ");
  return (
    <figure
      className="m-0 flex flex-col gap-3 rounded-xl border p-5 shadow-sm"
      style={{ background: cfg.colorBg, color: cfg.colorText, borderColor: "rgba(15,23,42,0.08)" }}
    >
      {cfg.showRating && t.rating ? <Stars n={t.rating} accent={cfg.colorAccent} /> : null}
      <blockquote className="m-0 text-sm leading-relaxed">{t.text}</blockquote>
      <figcaption className="mt-auto flex items-center gap-2.5">
        {cfg.showAvatar &&
          (t.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.authorAvatar} alt={t.authorName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: cfg.colorAccent }}
            >
              {t.authorName.charAt(0).toUpperCase()}
            </div>
          ))}
        <div>
          <div className="text-sm font-semibold">{t.authorName}</div>
          {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
        </div>
      </figcaption>
    </figure>
  );
}

export function WidgetPreview({
  config,
  testimonials,
}: {
  config: WidgetConfigDTO;
  testimonials: PreviewTestimonial[];
}) {
  const items = testimonials
    .filter((t) => !t.rating || t.rating >= config.filterMinRating || config.filterMinRating <= 1)
    .slice(0, config.maxItems);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-muted-foreground">
        Approve some testimonials to see them here.
      </div>
    );
  }

  if (config.style === "badge") {
    const rated = items.filter((t) => t.rating);
    const avg = rated.length ? rated.reduce((a, t) => a + (t.rating || 0), 0) / rated.length : 0;
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm"
        style={{ background: config.colorBg, color: config.colorText, borderColor: "rgba(15,23,42,0.08)" }}
      >
        {avg ? <Stars n={Math.round(avg)} accent={config.colorAccent} /> : null}
        <span>
          <b>{avg ? avg.toFixed(1) : "New"}</b>{" "}
          <span className="text-xs opacity-60">({items.length} reviews)</span>
        </span>
      </div>
    );
  }

  if (config.style === "single") {
    return (
      <div className="mx-auto max-w-md">
        <Card t={items[0]} cfg={config} />
      </div>
    );
  }

  if (config.style === "carousel") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((t) => (
          <div key={t._id} className="min-w-[280px]">
            <Card t={t} cfg={config} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((t) => (
        <Card key={t._id} t={t} cfg={config} />
      ))}
    </div>
  );
}
