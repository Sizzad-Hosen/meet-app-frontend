"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { resetPasswordSchema } from "@/lib/validations";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setMessage("");

    try {
      const result = await resetPassword(values).unwrap();
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
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Email address" type="email" {...register("email")} />
        <FormMessage message={errors.email?.message} tone="error" />
        <Input
          minLength={6}
          placeholder="New password"
          type="password"
          {...register("newPassword")}
        />
        <FormMessage message={errors.newPassword?.message} tone="error" />
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
