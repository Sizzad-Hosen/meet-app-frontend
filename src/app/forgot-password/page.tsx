"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const result = await forgotPassword({
        email: String(form.get("email")),
      }).unwrap();
      setTone("success");
      setMessage(result.message);
    } catch (error) {
      setTone("error");
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <AuthPanel
      description="Send the backend password reset email, then use the reset form after receiving your email."
      eyebrow="Account recovery"
      title="Recover access without leaving the flow."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">
          Forgot password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your account email address.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="email" placeholder="Email address" required type="email" />
        <FormMessage message={message} tone={tone} />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Ready to sign in?{" "}
        <Link className="font-medium text-cyan-700" href="/login">
          Back to login
        </Link>
      </p>
    </AuthPanel>
  );
}
