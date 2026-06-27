"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  toastMessage?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = "sm",
  className,
}: CopyButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ description: toastMessage });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ description: "Couldn't copy — please copy manually.", variant: "destructive" });
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={copy} className={cn(className)}>
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {size !== "icon" && <span className="ml-1.5">{copied ? "Copied" : label}</span>}
    </Button>
  );
}
