/**
 * Where to go after joining. Only paths on this site are allowed: "//evil.com", "https://evil.com" and
 * backslash tricks all fall back to the home page, so a crafted join link can never send someone elsewhere.
 */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  // never send a freshly joined person back to the join page (or the old /login address)
  if (/^\/(join|login)(\/|\?|#|$)/.test(value)) return fallback;
  return value;
}
