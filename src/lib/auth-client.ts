import { createClient } from "@/lib/supabase/client";

/** What went wrong, in words the login screen can show (the texts live in the message files). */
export type AuthProblem = "rate" | "network" | "wrong" | "generic" | "notReady";

type AuthErrorLike = { code?: string; status?: number; name?: string; message?: string };

function problemOf(error: AuthErrorLike, kind: "send" | "verify" | "oauth"): AuthProblem {
  if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") return "rate";
  if (error.name === "AuthRetryableFetchError" || /failed to fetch|network/i.test(error.message ?? "")) return "network";
  // Supabase answers a wrong code and an expired code in the same way (otp_expired)
  if (kind === "verify" && (error.code === "otp_expired" || error.status === 403 || error.status === 400 || error.status === 422)) return "wrong";
  if (kind === "oauth" && (error.code === "validation_failed" || /provider is not enabled|unsupported provider/i.test(error.message ?? ""))) return "notReady";
  return "generic";
}

export type Providers = { google: boolean; facebook: boolean; email: boolean };

let providersPromise: Promise<Providers> | null = null;

/** Which login methods are switched on in Supabase. Asked once; buttons for methods that are off say "Soon". */
export function loadProviders(): Promise<Providers> {
  providersPromise ??= fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
  })
    .then((r) => r.json())
    .then((j) => ({ google: !!j?.external?.google, facebook: !!j?.external?.facebook, email: j?.external?.email !== false }))
    // if the question fails, let people try: any real problem shows up as a friendly message
    .catch(() => ({ google: true, facebook: false, email: true }));
  return providersPromise;
}

export type Outcome<T = void> = { ok: true; value: T } | { ok: false; problem: AuthProblem };

/** Emails a 6-digit code. Creates the account on the first login. */
export async function sendEmailCode(email: string): Promise<Outcome> {
  try {
    const { error } = await createClient().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    return error ? { ok: false, problem: problemOf(error, "send") } : { ok: true, value: undefined };
  } catch {
    return { ok: false, problem: "network" };
  }
}

export type LoggedIn = { id: string; email: string | null; name: string | null };

/** Checks the 6-digit code. On success the login cookie is saved by the Supabase client. */
export async function verifyEmailCode(email: string, code: string): Promise<Outcome<LoggedIn>> {
  try {
    const { data, error } = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: "email" });
    if (error || !data.user) return { ok: false, problem: error ? problemOf(error, "verify") : "generic" };
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : null;
    return { ok: true, value: { id: data.user.id, email: data.user.email ?? null, name } };
  } catch {
    return { ok: false, problem: "network" };
  }
}

/** Sends the visitor to Google. They come back to /auth/callback, then on to `next`. */
export async function signInWithProvider(provider: "google" | "facebook", next: string): Promise<Outcome> {
  try {
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    return error ? { ok: false, problem: problemOf(error, "oauth") } : { ok: true, value: undefined };
  } catch {
    return { ok: false, problem: "network" };
  }
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const CODE_LENGTH = 6;
