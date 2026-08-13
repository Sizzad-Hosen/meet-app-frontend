export function normalizeMeetingCode(code: string): string {
  return code.replace(/[^a-z0-9]/gi, "").toUpperCase();
}
