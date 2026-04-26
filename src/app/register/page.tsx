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
import { registerSchema } from "@/lib/validations";
import { useRegisterMutation, useSendVerificationEmailMutation } from "@/redux/features/auth/authApi";

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";
  const [register, { isLoading }] = useRegisterMutation();
  const [sendVerificationEmail] = useSendVerificationEmailMutation();
  const [message, setMessage] = useState("");
  const {
    formState: { errors },
    handleSubmit,
    register: registerField,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setMessage("");

    try {
      await register(values).unwrap();
      await sendVerificationEmail({ email: values.email }).unwrap();
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <AuthPanel
      description="Create your account, then log in to receive the access token used by protected meeting routes."
      eyebrow="New workspace"
      title="Set up your collaboration account."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">Register</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your backend currently creates the user, then login issues the token.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Full name" {...registerField("name")} />
        <FormMessage message={errors.name?.message} tone="error" />
        <Input placeholder="Email address" type="email" {...registerField("email")} />
        <FormMessage message={errors.email?.message} tone="error" />
        <Input
          minLength={6}
          placeholder="Password"
          type="password"
          {...registerField("password")}
        />
        <FormMessage message={errors.password?.message} tone="error" />
        <FormMessage message={message} tone="error" />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          className="font-medium text-cyan-700"
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        >
          Login
        </Link>
      </p>
    </AuthPanel>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
          Loading registration...
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
