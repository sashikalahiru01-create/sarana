import "server-only";
import { createClient } from "@/lib/supabase/server";

export type DayPeriod = "night" | "dawn" | "day" | "dusk";

/** Part of the day in Sri Lanka (UTC+5:30, no daylight saving), whatever the server's own time zone is. */
export function getDayPeriod(now = new Date()): DayPeriod {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Colombo" }).format(now)) % 24;
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "dusk";
  return "night";
}

/** Urgent animals nobody has offered to help yet. Null if the database cannot be reached. */
export async function getWaitingCount(): Promise<number | null> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("pets")
      .select("id", { count: "exact", head: true })
      .eq("is_urgent", true)
      .eq("status", "reported");
    return error ? null : (count ?? 0);
  } catch {
    return null;
  }
}
