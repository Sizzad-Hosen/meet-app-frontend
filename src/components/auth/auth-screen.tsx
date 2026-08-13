"use client";

import { useState, type FormEvent } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/components/meeting/meeting.utils";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/redux/features/auth/authApi";

type AuthMode = "login" | "register";

export function AuthScreen({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password }).unwrap();
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
        }).unwrap();
      }
      onAuthenticated?.();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => current === "login" ? "register" : "login");
    setMessage(null);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-white px-4">
      <section className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><Video className="size-6" /></span>
          <span className="text-2xl font-semibold tracking-tight text-slate-900">Meet Apps</span>
        </div>
        <div className="rounded-2xl border border-slate-200 p-7 shadow-sm">
          <h1 className="text-center text-2xl font-semibold text-slate-900">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-center text-sm text-slate-500">Sign in to start or join a secure meeting.</p>
          <form className="mt-7 space-y-4" onSubmit={submit}>
            {mode === "register" && <Input minLength={2} onChange={(event) => setName(event.target.value)} placeholder="Full name" required value={name} />}
            <Input onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required type="email" value={email} />
            <Input minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required type="password" value={password} />
            <Button className="h-11 w-full rounded-lg bg-blue-600 hover:bg-blue-700" disabled={pending} type="submit">
              {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
          <button className="mt-5 w-full text-sm font-medium text-blue-600 hover:text-blue-700" onClick={toggleMode} type="button">
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}
