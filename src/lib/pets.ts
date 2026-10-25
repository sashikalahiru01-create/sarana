import { createClient } from "@/lib/supabase/client";
import type { AnimalType, PetStatus } from "./domain";

export type Pet = {
  id: string;
  animal_type: AnimalType;
  status: PetStatus;
  is_urgent: boolean;
  conditions: string[];
  lat: number;
  lng: number;
  photo_paths: string[];
  note: string | null;
  location_label: string | null;
  created_at: string;
};

export type PetFilter = "all" | "dogs" | "cats" | "urgent" | "needsHome";

export const petFilters: PetFilter[] = ["all", "dogs", "cats", "urgent", "needsHome"];

/** Colour of a pin or badge for each step of the status flow (the brand status colours). */
export const statusColor: Record<PetStatus, string> = {
  reported: "#e4572e",
  help_on_the_way: "#2e6bd8",
  safe: "#1f8a70",
  adopted: "#f2b544",
};

export const PET_COLUMNS = "id, animal_type, status, is_urgent, conditions, lat, lng, photo_paths, note, location_label, created_at";

/** The newest visible animals. Hidden (moderated) ones never come back: the database hides them. */
export async function fetchPets(): Promise<Pet[]> {
  const { data, error } = await createClient().from("pets").select(PET_COLUMNS).order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  return (data ?? []) as Pet[];
}

export function matchesFilter(pet: Pet, filter: PetFilter): boolean {
  switch (filter) {
    case "dogs":
      return pet.animal_type === "dog";
    case "cats":
      return pet.animal_type === "cat";
    case "urgent":
      return pet.is_urgent && pet.status !== "adopted";
    case "needsHome":
      return pet.conditions.includes("needs_home") && pet.status !== "adopted";
    default:
      return true;
  }
}

/** Straight-line distance in kilometres (haversine). Good enough for "how far is it". */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  return km < 10 ? km.toFixed(1) : String(Math.round(km));
}

/** { unit, n } for "3 hours ago" style text. The words themselves live in the message files. */
export function agoParts(iso: string, now = Date.now()): { unit: "now" | "minutes" | "hours" | "days"; n: number } {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return { unit: "now", n: 0 };
  if (minutes < 60) return { unit: "minutes", n: minutes };
  if (minutes < 60 * 24) return { unit: "hours", n: Math.round(minutes / 60) };
  return { unit: "days", n: Math.round(minutes / (60 * 24)) };
}
