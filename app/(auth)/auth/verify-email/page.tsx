import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="rounded-full bg-indigo-50 p-3">
          <MailCheck className="text-primary" size={28} />
        </div>
        <h2 className="text-xl font-semibold">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          Open the verification link we emailed you to activate your account. Once verified,
          you can sign in.
        </p>
        <Button asChild className="mt-2">
          <Link href="/auth/login">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
