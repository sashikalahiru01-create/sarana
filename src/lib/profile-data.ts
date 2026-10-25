import "server-only";
import { createClient } from "@/lib/supabase/server";
import { volunteerSkills, type VolunteerSkill } from "./domain";
import { PET_COLUMNS, type Pet } from "./pets";
import type { MyVolunteer } from "./volunteers";

/** What the person did for an animal. All three status changes are shown as one: "you updated its status". */
export type HelpRole = "offer_help" | "offer_home" | "update" | "status";

export type HelpedPet = { pet: Pet; role: HelpRole; at: string };

export type ProfileData = {
  displayName: string | null;
  isAdmin: boolean;
  volunteer: MyVolunteer | null;
  reports: Pet[];
  helped: HelpedPet[];
};

const roleOf = (kind: string): HelpRole | null => {
  if (kind === "offer_help" || kind === "offer_home" || kind === "update") return kind;
  if (kind === "help_on_the_way" || kind === "safe" || kind === "adopted") return "status";
  return null;
};

/** Everything the profile page shows, for the logged-in person. The database only returns what they may see. */
export async function getProfileData(userId: string): Promise<ProfileData> {
  const supabase = await createClient();

  const [profile, volunteer, reports, activity] = await Promise.all([
    supabase.from("profiles").select("display_name, role").eq("id", userId).maybeSingle(),
    supabase.from("volunteers").select("full_name, phone, skills, area, lat, lng, radius_km, is_active").eq("user_id", userId).maybeSingle(),
    supabase.from("pets").select(PET_COLUMNS).eq("reporter_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase
      .from("reports")
      .select(`kind, created_at, pet:pets(${PET_COLUMNS})`)
      .eq("author_id", userId)
      .in("kind", ["offer_help", "offer_home", "update", "help_on_the_way", "safe", "adopted"])
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (reports.error) throw reports.error;
  if (activity.error) throw activity.error;

  // One card per animal: the latest thing the person did for it.
  const seen = new Set<string>();
  const helped: HelpedPet[] = [];
  for (const row of (activity.data ?? []) as unknown as { kind: string; created_at: string; pet: Pet | null }[]) {
    const role = roleOf(row.kind);
    if (!row.pet || !role || seen.has(row.pet.id)) continue;
    seen.add(row.pet.id);
    helped.push({ pet: row.pet, role, at: row.created_at });
  }

  const v = volunteer.data;
  return {
    displayName: profile.data?.display_name ?? null,
    isAdmin: profile.data?.role === "admin",
    volunteer: v
      ? {
          name: v.full_name,
          phone: v.phone,
          skills: (v.skills as string[]).filter((s): s is VolunteerSkill => (volunteerSkills as readonly string[]).includes(s)),
          area: v.area,
          lat: v.lat,
          lng: v.lng,
          radiusKm: v.radius_km,
          isActive: v.is_active,
        }
      : null,
    reports: (reports.data ?? []) as Pet[],
    helped,
  };
}
