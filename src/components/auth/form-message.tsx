export function FormMessage({
  message,
  tone = "info",
}: {
  message?: string;
  tone?: "info" | "error" | "success";
}) {
  if (!message) {
    return null;
  }

  const toneClass = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${toneClass}`}>
      {message}
    </p>
  );
}
