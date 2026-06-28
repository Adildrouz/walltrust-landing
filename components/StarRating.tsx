"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 18,
  className,
  readOnly = false,
}: StarRatingProps) {
  const interactive = !readOnly && !!onChange;
  return (
    <div className={cn("flex items-center gap-0.5", className)} role={interactive ? "radiogroup" : "img"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-transform",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default"
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={cn(
              star <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
