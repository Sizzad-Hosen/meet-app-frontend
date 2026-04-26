"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hook";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && !accessToken) {
      router.replace("/login");
    }
  }, [accessToken, ready, router]);

  if (!ready || !accessToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Checking session...
      </main>
    );
  }

  return children;
}
