/**
 * Where to go after logging in. Only paths on this site are allowed: "//evil.com", "https://evil.com" and
 * backslash tricks all fall back to the home page, so a crafted login link can never send someone elsewhere.
 */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  // never send a freshly logged-in person back to the login page
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/login/")) return fallback;
  return value;
}
