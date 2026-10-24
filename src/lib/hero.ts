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

/** What a waiting animal looks like in the window. Young ones are drawn as two puppies or two kittens. */
export type StreetAnimal = "dog" | "cat" | "pups" | "kittens";

export type Waiting = { count: number; animals: StreetAnimal[] };

/**
 * Urgent animals nobody has offered to help yet: how many, and the kind of the latest four
 * (those are the ones shown in the window). Null if the database cannot be reached.
 */
export async function getWaiting(): Promise<Waiting | null> {
  try {
    const supabase = await createClient();
    const { data, count, error } = await supabase
      .from("pets")
      .select("animal_type, conditions", { count: "exact" })
      .eq("is_urgent", true)
      .eq("status", "reported")
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) return null;
    const animals = (data ?? []).map((pet): StreetAnimal => {
      const young = (pet.conditions as string[] | null)?.includes("young");
      return pet.animal_type === "cat" ? (young ? "kittens" : "cat") : young ? "pups" : "dog";
    });
    return { count: count ?? animals.length, animals };
  } catch {
    return null;
  }
}
