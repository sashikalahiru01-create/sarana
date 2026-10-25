"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Logs the person out (the cookie is cleared) and takes them to the home page. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
