import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { BrandMark } from "./BrandMark";

export async function SiteFooter() {
  const { t } = await getTranslator();

  return (
    // Extra bottom padding on phones keeps the footer clear of the floating bottom bar.
    <footer className="site-footer px-4 pb-36 pt-6 text-sm text-muted md:pb-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 border-t border-line/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BrandMark className="!size-8" />
          <p>
            <strong className="font-heading font-extrabold text-foreground">{t("common.appName")}</strong> · {t("common.tagline")}
          </p>
        </div>
        <nav aria-label={t("common.appName")} className="flex flex-wrap gap-x-5">
          {(
            [
              ["/story", "nav.story"],
              ["/map", "nav.map"],
              ["/volunteer", "nav.volunteer"],
              ["/about", "nav.about"],
            ] as const
          ).map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center font-semibold hover:text-foreground">
              {t(label)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
