"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { loginSchema } from "@/lib/validations";
import { useLoginMutation } from "@/redux/features/auth/authApi";

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";
  const [login, { isLoading }] = useLoginMutation();
  const [message, setMessage] = useState("");
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setMessage("");

    try {
      await login(values).unwrap();
      router.push(redirectTo);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <AuthPanel
      description="Sign in to manage meetings, waiting rooms, polls, recordings, and LiveKit access from one focused workspace."
      eyebrow="Secure access"
      title="Welcome back to your meeting console."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">Login</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use your backend account credentials.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Email address" type="email" {...register("email")} />
        <FormMessage message={errors.email?.message} tone="error" />
        <Input placeholder="Password" type="password" {...register("password")} />
        <FormMessage message={errors.password?.message} tone="error" />
        <FormMessage message={message} tone="error" />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-medium text-cyan-700" href="/forgot-password">
          Forgot password?
        </Link>
        <Link
          className="font-medium text-slate-700"
          href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
        >
          Create account
        </Link>
      </div>
    </AuthPanel>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
          Loading login...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
