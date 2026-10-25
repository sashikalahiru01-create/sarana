import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { HelpType, ReportKind } from "./domain";
import { PET_COLUMNS, type Pet } from "./pets";

/** One line of an animal's story: the first report, status changes, updates and offers of help. */
export type TimelineEntry = {
  id: string;
  kind: ReportKind;
  help_type: HelpType | null;
  note: string | null;
  created_at: string;
  /** The author's public display name, or null for an anonymous report or a person without a name. */
  author_name: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One animal, or null if the link is wrong, or it was removed or hidden. Cached, so the page and its metadata share one query. */
export const getPet = cache(async (id: string): Promise<Pet | null> => {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("pets").select(PET_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Pet | null;
});

/** The animal's story, newest first. */
export async function getTimeline(petId: string): Promise<TimelineEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, kind, help_type, note, created_at, author:profiles(display_name)")
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  type Row = Omit<TimelineEntry, "author_name"> & { author: { display_name: string | null } | null };
  return ((data ?? []) as unknown as Row[]).map(({ author, ...rest }) => ({ ...rest, author_name: author?.display_name?.trim() || null }));
}

/** Only volunteers and admins may move an animal along the status flow (the database enforces it too). */
export async function canSetStatus(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const [volunteer, profile] = await Promise.all([
    supabase.from("volunteers").select("user_id").eq("user_id", userId).eq("is_active", true).maybeSingle(),
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
  ]);
  return Boolean(volunteer.data) || profile.data?.role === "admin";
}
