import en from "../../messages/en.json";
import si from "../../messages/si.json";
import type { Locale } from "./config";

// English is the source of truth for the shape: every other language must match it.
export type Messages = typeof en;

const catalog: Record<Locale, Messages> = { en, si };

export function getMessages(locale: Locale): Messages {
  return catalog[locale];
}

export const fallbackMessages: Messages = en;
