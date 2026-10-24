import { Camera, LogIn } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MainNav } from "./MainNav";

export async function SiteHeader() {
  const { t } = await getTranslator();

  return (
    <header className="sticky top-0 z-40 border-b border-(--glass-line) bg-(--glass) backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-heading text-xl font-extrabold tracking-tight">
          <BrandMark />
          {t("common.appName")}
        </Link>

        <MainNav />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/login" aria-label={t("nav.login")} className="btn btn-ghost hidden !min-h-11 !px-3 whitespace-nowrap md:inline-flex lg:!px-4">
            <LogIn size={18} aria-hidden="true" />
            <span className="hidden lg:inline">{t("nav.login")}</span>
          </Link>
          <Link href="/report" className="btn btn-primary hidden !min-h-11 !px-4 whitespace-nowrap md:inline-flex">
            <Camera size={18} aria-hidden="true" />
            {t("home.reportCta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
