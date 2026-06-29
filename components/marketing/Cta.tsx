import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta({
  size = "default",
  className,
}: {
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <Button asChild size={size} className={className}>
      <Link href="/auth/signup">
        Start free — no card needed
        <ArrowRight size={size === "lg" ? 18 : 16} className="ml-2" />
      </Link>
    </Button>
  );
}

export function CtaBanner({ heading, sub }: { heading: string; sub?: string }) {
  return (
    <section className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
      <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
      {sub && <p className="mx-auto mt-2 max-w-xl text-indigo-100">{sub}</p>}
      <div className="mt-6 flex justify-center">
        <Button asChild size="lg" variant="secondary">
          <Link href="/auth/signup">Start free — no card needed</Link>
        </Button>
      </div>
    </section>
  );
}
