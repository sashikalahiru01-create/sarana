// Tamil ("ta") is added later: add it here, add messages/ta.json, and register it in messages.ts.
export const locales = ["si", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "si";
export const LOCALE_COOKIE = "sarana_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
