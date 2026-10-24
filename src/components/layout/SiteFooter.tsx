import { getTranslator } from "@/i18n/server";

export async function SiteFooter() {
  const { t } = await getTranslator();

  return (
    // Bottom padding on phones keeps the footer clear of the fixed bottom bar.
    <footer className="bg-cream px-4 pb-28 text-[13px] text-[#7a6f5d] md:pb-8 dark:bg-midnight dark:text-cream/60">
      <div className="mx-auto max-w-[900px] border-t border-[#ead7b9] pt-5 dark:border-white/10">
        {t("common.appName")} · {t("common.tagline")}
      </div>
    </footer>
  );
}
