import Link from "next/link";
import { Video } from "lucide-react";

export function AuthPanel({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex min-h-[320px] flex-col justify-between bg-[linear-gradient(135deg,#0f172a_0%,#155e75_52%,#14b8a6_100%)] p-6 text-white lg:min-h-screen lg:p-10">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid size-10 place-items-center rounded-md bg-white text-slate-950">
            <Video className="size-5" />
          </span>
          <span className="text-lg font-semibold">Meet Apps</span>
        </Link>
        <div className="max-w-xl">
          <p className="text-sm font-medium text-cyan-100">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-cyan-50">
            {description}
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {children}
        </div>
      </section>
    </main>
  );
}
