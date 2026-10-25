import type { Translate } from "@/i18n/translator";
import { agoParts } from "./pets";

/** "Just now", "5 min ago", "2 d ago" in the visitor's language. */
export function agoLabel(t: Translate, iso: string): string {
  const ago = agoParts(iso);
  return ago.unit === "now" ? t("map.ago.now") : t(`map.ago.${ago.unit}`, { n: ago.n });
}
