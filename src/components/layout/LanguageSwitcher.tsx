"use client";

import { useTransition } from "react";
import { locales } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { useLocale, useT } from "@/i18n/client";

export function LanguageSwitcher() {
  const t = useT();
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="flex rounded-full border border-(--glass-line) bg-surface/60 p-0.5"
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            disabled={pending}
            onClick={() => {
              if (!active) startTransition(() => setLocale(locale));
            }}
            className={`min-h-11 min-w-11 rounded-full px-2.5 text-[13px] sm:px-3.5 sm:text-sm font-bold transition duration-200 ${
              active ? "bg-midnight text-white dark:bg-cream dark:text-midnight" : "text-muted hover:text-foreground"
            }`}
          >
            {t(`language.${locale}`)}
          </button>
        );
      })}
    </div>
  );
}
