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
