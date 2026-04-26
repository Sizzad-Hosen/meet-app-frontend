"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { useVerifyEmailMutation } from "@/redux/features/auth/authApi";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [message, setMessage] = useState(
    token ? "Checking verification token..." : "Verification token is missing.",
  );
  const [tone, setTone] = useState<"info" | "error" | "success">(
    token ? "info" : "error",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail({ token })
      .unwrap()
      .then((result) => {
        setTone("success");
        setMessage(result.message);
      })
      .catch((error) => {
        setTone("error");
        setMessage(getApiErrorMessage(error));
      });
  }, [token, verifyEmail]);

  return (
    <AuthPanel
      description="Email verification unlocks the verified account state used by the backend user model."
      eyebrow="Email verification"
      title="Confirm your account email."
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-950">Verify email</h2>
        <FormMessage message={message} tone={tone} />
        <Button className="w-full" disabled={isLoading}>
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    </AuthPanel>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
          Loading verification...
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
