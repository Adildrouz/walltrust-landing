import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <ShieldCheck className="text-primary" size={26} />
        <span className="text-xl font-bold tracking-tight">WallTrust</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
