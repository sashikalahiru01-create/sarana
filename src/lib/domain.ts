// Shared vocabulary. These values match the check constraints in supabase/schema.sql.

export const animalTypes = ["dog", "cat"] as const;
export type AnimalType = (typeof animalTypes)[number];

/** reported -> help_on_the_way -> safe -> adopted */
export const petStatuses = ["reported", "help_on_the_way", "safe", "adopted"] as const;
export type PetStatus = (typeof petStatuses)[number];

export const volunteerSkills = ["feeding", "transport", "foster", "vet_care"] as const;
export type VolunteerSkill = (typeof volunteerSkills)[number];

export const helpTypes = ["food", "vet", "transport", "foster"] as const;
export type HelpType = (typeof helpTypes)[number];

export const reportKinds = [
  "reported",
  "help_on_the_way",
  "safe",
  "adopted",
  "update",
  "offer_help",
  "offer_home",
] as const;
export type ReportKind = (typeof reportKinds)[number];

export const PHOTO_BUCKET = "pet-photos";

/** Condition chips on the report form. Stored in pets.conditions. */
export const petConditions = ["injured", "sick", "hungry", "young", "needs_home", "friendly"] as const;
export type PetCondition = (typeof petConditions)[number];

/** Any of these marks the pet urgent: injured, sick, puppies/kittens. */
export const urgentConditions: readonly PetCondition[] = ["injured", "sick", "young"];

export const isUrgent = (conditions: readonly string[]) =>
  conditions.some((c) => (urgentConditions as readonly string[]).includes(c));

export const MAX_PHOTOS = 3;
export const PHOTO_TARGET_BYTES = 200 * 1024;
export const PHOTO_MAX_WIDTH = 1600;
