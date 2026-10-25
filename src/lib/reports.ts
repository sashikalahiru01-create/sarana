import { createClient } from "@/lib/supabase/client";
import { isUrgent, PHOTO_BUCKET, type AnimalType } from "./domain";

export type ReportInput = {
  animalType: AnimalType;
  conditions: string[];
  note: string;
  contact: string;
  lat: number;
  lng: number;
  locationLabel: string;
  photos: Blob[];
};

export type ReportProgress = { stage: "upload" | "save"; value: number };

export class ReportError extends Error {
  constructor(public code: "upload" | "save", cause?: unknown) {
    super(`report failed at ${code}`, { cause });
  }
}

const extensionFor = (blob: Blob) => (blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg");

/**
 * Uploads the photos, then saves the pet, linked to the logged-in person. The report form asks for login before
 * calling this (the database itself still accepts anonymous reports; see the note in supabase/schema.sql).
 * Returns the new pet id.
 */
export async function submitReport(input: ReportInput, onProgress: (p: ReportProgress) => void): Promise<string> {
  const supabase = createClient();
  const id = crypto.randomUUID();
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const paths: string[] = [];
  for (const [i, photo] of input.photos.entries()) {
    const path = `${folder}/${id}-${i + 1}.${extensionFor(photo)}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, photo, { contentType: photo.type, cacheControl: "31536000", upsert: false });
    if (error) throw new ReportError("upload", error);
    paths.push(path);
    onProgress({ stage: "upload", value: (i + 1) / (input.photos.length + 1) });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const reporterId = sessionData.session?.user.id ?? null;

  const { error: petError } = await supabase.from("pets").insert({
    id,
    animal_type: input.animalType,
    is_urgent: isUrgent(input.conditions),
    conditions: input.conditions,
    note: input.note.trim() || null,
    lat: input.lat,
    lng: input.lng,
    location_label: input.locationLabel.trim() || null,
    photo_paths: paths,
    reporter_id: reporterId,
  });
  if (petError) throw new ReportError("save", petError);

  // The contact is optional and private. If it fails, the report itself is already saved.
  const contact = input.contact.trim();
  if (contact) {
    await supabase.from("pet_contacts").insert({ pet_id: id, contact });
  }

  onProgress({ stage: "save", value: 1 });
  return id;
}

/** Public URL of a photo in the pet-photos bucket. */
export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
