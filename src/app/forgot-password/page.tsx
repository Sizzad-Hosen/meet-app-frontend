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
import { emailSchema } from "@/lib/validations";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";

type EmailFormValues = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });

  async function onSubmit(values: EmailFormValues) {
    setMessage("");

    try {
      const result = await forgotPassword(values).unwrap();
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
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Email address" type="email" {...register("email")} />
        <FormMessage message={errors.email?.message} tone="error" />
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
