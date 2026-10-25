import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Google (and later Facebook) send the visitor back here with a one-time code.
 * We swap the code for a session cookie, then continue to where they were going.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  // the provider said no, or the link was used twice
  const failed = new URL("/join", origin);
  failed.searchParams.set("error", "callback");
  if (next !== "/") failed.searchParams.set("next", next);
  return NextResponse.redirect(failed);
}
