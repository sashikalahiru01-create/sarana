import { Check, Map } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { getDayPeriod, getWaiting } from "@/lib/hero";
import { HeroAskProvider, ReportButton } from "./hero-ask";
import { HeroScene } from "./HeroScene";

export async function Hero() {
  const [{ t }, waiting] = await Promise.all([getTranslator(), getWaiting()]);
  const period = getDayPeriod();

  return (
    <HeroAskProvider>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-10 md:pt-14">
        <div className="flex flex-col items-start gap-5">
          <p className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-3 pr-4 text-[13px] font-bold text-coral-ink dark:text-brownie">
            <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
              <span className="absolute size-2.5 animate-ping rounded-full bg-coral/50" />
              <span className="size-2.5 rounded-full bg-coral" />
            </span>
            {t("home.hero.eyebrow")}
          </p>
          <h1 className="text-[clamp(34px,6.2vw,66px)] leading-[1.12] tracking-[-0.03em]">{t("home.hero.title")}</h1>
          <p className="max-w-[48ch] text-[17px] leading-[1.7] text-muted">{t("home.hero.subtitle")}</p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ReportButton label={t("home.reportCta")} />
            <Link href="/map" className="btn btn-ghost !min-h-14">
              <Map size={20} aria-hidden="true" />
              {t("home.hero.secondary")}
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
            {(["trust1", "trust2", "trust3"] as const).map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <Check size={16} className="text-green" aria-hidden="true" />
                {t(`home.hero.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <HeroScene period={period} waiting={waiting} />
      </section>
    </HeroAskProvider>
  );
}
