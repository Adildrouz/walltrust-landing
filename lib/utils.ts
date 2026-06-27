import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert Mongoose lean docs / ObjectIds / Dates into plain JSON-safe objects. */
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type PlanName = "free" | "starter" | "pro";

export const PLAN_LIMITS: Record<
  PlanName,
  { testimonials: number; pages: number; hasRichSnippets: boolean; hasBranding: boolean }
> = {
  free: { testimonials: 5, pages: 1, hasRichSnippets: false, hasBranding: true },
  starter: { testimonials: Infinity, pages: 3, hasRichSnippets: true, hasBranding: false },
  pro: { testimonials: Infinity, pages: Infinity, hasRichSnippets: true, hasBranding: false },
};

export function generateUsername(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) + Math.floor(Math.random() * 999)
  );
}

export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) +
    "-" +
    Math.floor(Math.random() * 99)
  );
}
