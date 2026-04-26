"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useLoginMutation } from "@/redux/features/auth/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      }).unwrap();
      router.push("/");
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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="email" placeholder="Email address" required type="email" />
        <Input name="password" placeholder="Password" required type="password" />
        <FormMessage message={message} tone="error" />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-medium text-cyan-700" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-medium text-slate-700" href="/register">
          Create account
        </Link>
      </div>
    </AuthPanel>
  );
}
