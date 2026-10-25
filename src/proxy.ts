import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { realtimeFallback } from "@/lib/supabase/realtime-fallback";

/**
 * Keeps a logged-in visitor's session fresh. Supabase sessions expire after an hour; this refreshes the
 * cookie on the way in, so pages never see an expired login. Visitors with no login cookie are skipped,
 * so anonymous pages pay nothing for this.
 */
export async function proxy(request: NextRequest) {
  const hasLogin = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasLogin) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    ...realtimeFallback,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims checks the token locally and refreshes it only when it has expired.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // everything except static files and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
