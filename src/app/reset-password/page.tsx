"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";

export default function ResetPasswordPage() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const result = await resetPassword({
        email: String(form.get("email")),
        newPassword: String(form.get("newPassword")),
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
      description="Your current backend reset route accepts email and a new password. Token validation can be added when the backend exposes it."
      eyebrow="Reset credentials"
      title="Choose a new password for your account."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">
          Reset password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Password must be at least 6 characters.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="email" placeholder="Email address" required type="email" />
        <Input
          minLength={6}
          name="newPassword"
          placeholder="New password"
          required
          type="password"
        />
        <FormMessage message={message} tone={tone} />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Password updated?{" "}
        <Link className="font-medium text-cyan-700" href="/login">
          Login
        </Link>
      </p>
    </AuthPanel>
  );
}
