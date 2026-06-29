"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { label: "Compare tools", href: "/compare" },
  { label: "For freelancers", href: "/for/freelancers" },
  { label: "For coaches", href: "/for/coaches" },
  { label: "Integrations", href: "/integrations" },
  { label: "Widget types", href: "/widgets" },
];

export function ResourcesNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-600 outline-none hover:text-slate-900">
        Resources
        <ChevronDown size={15} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {links.map((l) => (
          <DropdownMenuItem key={l.href} asChild>
            <Link href={l.href}>{l.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
