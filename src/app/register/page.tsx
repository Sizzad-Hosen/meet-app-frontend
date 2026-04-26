"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useRegisterMutation } from "@/redux/features/auth/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      await register({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
      }).unwrap();
      router.push("/login");
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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="name" placeholder="Full name" required />
        <Input name="email" placeholder="Email address" required type="email" />
        <Input
          minLength={6}
          name="password"
          placeholder="Password"
          required
          type="password"
        />
        <FormMessage message={message} tone="error" />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-cyan-700" href="/login">
          Login
        </Link>
      </p>
    </AuthPanel>
  );
}
