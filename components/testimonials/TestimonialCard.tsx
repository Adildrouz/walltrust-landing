"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Check, X, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { getInitials, cn } from "@/lib/utils";

export interface TestimonialDTO {
  _id: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatar?: string;
  text: string;
  rating?: number;
  photo?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
}

interface Props {
  testimonial: TestimonialDTO;
  busy?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToggleFeature: (id: string, featured: boolean) => void;
  onDelete: (id: string) => void;
}

export function TestimonialCard({
  testimonial: t,
  busy,
  onApprove,
  onReject,
  onToggleFeature,
  onDelete,
}: Props) {
  const subtitle = [t.authorTitle, t.authorCompany].filter(Boolean).join(", ");

  return (
    <Card
      className={cn(t.featured && "ring-2 ring-amber-300")}
      data-testid="testimonial-card"
      data-testimonial-id={t._id}
      data-status={t.status}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              {t.authorAvatar && <AvatarImage src={t.authorAvatar} alt={t.authorName} />}
              <AvatarFallback>{getInitials(t.authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium leading-tight">{t.authorName}</div>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {t.featured && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Featured</Badge>}
            <Badge
              variant={
                t.status === "approved" ? "default" : t.status === "pending" ? "secondary" : "destructive"
              }
              className="capitalize"
            >
              {t.status}
            </Badge>
          </div>
        </div>

        {t.rating ? <StarRating value={t.rating} readOnly size={16} /> : null}

        <p className="text-sm leading-relaxed text-slate-700">{t.text}</p>

        {t.photo && (
          <div className="relative h-40 w-full overflow-hidden rounded-md">
            <Image src={t.photo} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-muted-foreground">
            {format(new Date(t.createdAt), "MMM d, yyyy")}
          </span>
          <div className="flex items-center gap-1">
            {t.status !== "approved" && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => onApprove(t._id)}>
                <Check size={15} className="text-emerald-600" />
                <span className="ml-1">Approve</span>
              </Button>
            )}
            {t.status !== "rejected" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onReject(t._id)}
                aria-label="Reject"
              >
                <X size={15} className="text-red-500" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onToggleFeature(t._id, !t.featured)}
              aria-label="Toggle featured"
            >
              <Star size={15} className={cn(t.featured ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDelete(t._id)} aria-label="Delete">
              <Trash2 size={15} className="text-slate-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
