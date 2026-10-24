import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getMessages } from "./messages";
import { createTranslator } from "./translator";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** Translator for Server Components and metadata. Client Components use `useT()`. */
export async function getTranslator() {
  const locale = await getLocale();
  return { locale, t: createTranslator(getMessages(locale)) };
}
