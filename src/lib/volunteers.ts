import { createClient } from "@/lib/supabase/client";
import { volunteerSkills, type VolunteerSkill } from "./domain";

export type VolunteerDraft = {
  skills: VolunteerSkill[];
  area: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  name: string;
  phone: string;
};

export const EMPTY_DRAFT: VolunteerDraft = { skills: [], area: "", lat: null, lng: null, radiusKm: 10, name: "", phone: "" };

export const RADIUS_MIN = 1;
export const RADIUS_MAX = 50;

const DRAFT_KEY = "sarana_volunteer_draft";

/** The sign-up is kept on the phone while the person logs in, so they never have to type it twice. */
export function loadDraft(): VolunteerDraft {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as Partial<VolunteerDraft> | null;
    if (!raw || typeof raw !== "object") return EMPTY_DRAFT;
    return {
      skills: Array.isArray(raw.skills) ? raw.skills.filter((s): s is VolunteerSkill => (volunteerSkills as readonly string[]).includes(s)) : [],
      area: typeof raw.area === "string" ? raw.area.slice(0, 120) : "",
      lat: typeof raw.lat === "number" ? raw.lat : null,
      lng: typeof raw.lng === "number" ? raw.lng : null,
      radiusKm: typeof raw.radiusKm === "number" ? Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Math.round(raw.radiusKm))) : 10,
      name: typeof raw.name === "string" ? raw.name.slice(0, 100) : "",
      phone: typeof raw.phone === "string" ? raw.phone.slice(0, 20) : "",
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function saveDraft(draft: VolunteerDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // storage can be blocked; the form still works, it just cannot be restored later
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** Sri Lankan numbers like 0771234567 or +94 77 123 4567: digits, spaces and dashes, 7 to 20 characters. */
export const isValidPhone = (phone: string) => /^\+?[\d][\d\s-]{5,18}[\d]$/.test(phone.trim());

export type SubmitResult = { status: "ok" } | { status: "login" } | { status: "already" } | { status: "error" };

/** Saves the sign-up for the logged-in person. If nobody is logged in, nothing is sent and the caller shows the log-in step. */
export async function submitVolunteer(draft: VolunteerDraft): Promise<SubmitResult> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return { status: "login" };

  const { error } = await supabase.from("volunteers").insert({
    user_id: userId,
    full_name: draft.name.trim(),
    phone: draft.phone.trim(),
    skills: draft.skills,
    area: draft.area.trim(),
    lat: draft.lat,
    lng: draft.lng,
    radius_km: draft.radiusKm,
    is_active: true,
  });
  if (!error) return { status: "ok" };
  return error.code === "23505" ? { status: "already" } : { status: "error" };
}
