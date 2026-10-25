import { createClient } from "@/lib/supabase/client";

/** What went wrong, in words the login screen can show (the texts live in the message files). */
export type AuthProblem = "rate" | "network" | "wrong" | "badPassword" | "weak" | "generic" | "notReady";

type AuthErrorLike = { code?: string; status?: number; name?: string; message?: string };

function problemOf(error: AuthErrorLike, kind: "send" | "verify" | "oauth" | "password" | "update"): AuthProblem {
  if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") return "rate";
  if (error.name === "AuthRetryableFetchError" || /failed to fetch|network/i.test(error.message ?? "")) return "network";
  // Supabase answers a wrong code and an expired code in the same way (otp_expired)
  if (kind === "verify" && (error.code === "otp_expired" || error.status === 403 || error.status === 400 || error.status === 422)) return "wrong";
  if (kind === "password" && (error.code === "invalid_credentials" || error.status === 400)) return "badPassword";
  if (kind === "update" && (error.code === "weak_password" || error.status === 422)) return "weak";
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

/** Emails a 6-digit code. Creates the account the first time (the person then chooses a password). */
export async function sendEmailCode(email: string): Promise<Outcome> {
  try {
    const { error } = await createClient().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    return error ? { ok: false, problem: problemOf(error, "send") } : { ok: true, value: undefined };
  } catch {
    return { ok: false, problem: "network" };
  }
}

export type LoggedIn = { id: string; email: string | null; name: string | null };

function loggedInFrom(user: { id: string; email?: string; user_metadata?: unknown }): LoggedIn {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : null;
  return { id: user.id, email: user.email ?? null, name };
}

/** Checks the 6-digit code. On success the login cookie is saved by the Supabase client. */
export async function verifyEmailCode(email: string, code: string): Promise<Outcome<LoggedIn>> {
  try {
    const { data, error } = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: "email" });
    if (error || !data.user) return { ok: false, problem: error ? problemOf(error, "verify") : "generic" };
    return { ok: true, value: loggedInFrom(data.user) };
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

/** What we know about an email: no account yet, an account without a password, or an account with one. */
export type EmailStatus = "none" | "no_password" | "password";

/**
 * Asks the database whether this email already has an account (see email_account_status in supabase/schema.sql).
 * If the question cannot be answered (for example the function is not installed yet), we treat the email as new:
 * the code step works for everyone, so nobody gets stuck.
 */
export async function checkEmail(email: string): Promise<Outcome<EmailStatus>> {
  try {
    const { data, error } = await createClient().rpc("email_account_status", { p_email: email.trim().toLowerCase() });
    if (error) {
      if (error.code === "PGRST202" || error.code === "42883" || error.code === "404") return { ok: true, value: "none" };
      return { ok: false, problem: problemOf(error, "send") };
    }
    return { ok: true, value: data === "password" || data === "no_password" ? data : "none" };
  } catch {
    return { ok: false, problem: "network" };
  }
}

/** Logs in with email and password. On success the login cookie is saved by the Supabase client. */
export async function signInWithPassword(email: string, password: string): Promise<Outcome<LoggedIn>> {
  try {
    const { data, error } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) return { ok: false, problem: error ? problemOf(error, "password") : "generic" };
    return { ok: true, value: loggedInFrom(data.user) };
  } catch {
    return { ok: false, problem: "network" };
  }
}

/** Sets (or replaces) the password of the person who is logged in, right after they proved their email with a code. */
export async function setPassword(password: string): Promise<Outcome> {
  try {
    const { error } = await createClient().auth.updateUser({ password });
    // choosing the very same password again is fine
    if (error && error.code !== "same_password") return { ok: false, problem: problemOf(error, "update") };
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, problem: "network" };
  }
}

export const PASSWORD_MIN = 8;
/** bcrypt, which Supabase uses, only reads the first 72 bytes. */
export const PASSWORD_MAX = 72;

/** The password rules, one by one, so the screen can tick them off as the person types. */
export function checkPassword(password: string, confirm: string) {
  const length = password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
  const letter = /\p{L}/u.test(password);
  const number = /\d/.test(password);
  const match = password.length > 0 && password === confirm;
  return { length, letter, number, match, strong: length && letter && number };
}
