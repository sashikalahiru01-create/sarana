import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  /** Name from Google/Facebook, or null for an email login. */
  name: string | null;
  avatarUrl: string | null;
};

/**
 * The logged-in person, or null. Uses getClaims, which checks the login token locally instead of
 * asking Supabase on every page view.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;
    const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
    const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    return {
      id: claims.sub,
      email: text(claims.email),
      name: text(meta.full_name) ?? text(meta.name),
      avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
    };
  } catch {
    return null;
  }
});
