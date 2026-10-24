// To add a language: add it here, add messages/<code>.json (same keys as en.json), register it in messages.ts,
// and add a "language.<code>" name to every messages file. The order here is the order of the language switcher.
export const locales = ["si", "ta", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "si";
export const LOCALE_COOKIE = "sarana_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
