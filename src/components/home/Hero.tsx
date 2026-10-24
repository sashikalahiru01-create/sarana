import { Camera, Check, HandHeart, Map, MapPin } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { getDayPeriod, getWaiting } from "@/lib/hero";
import { AnimatedHeadline } from "./AnimatedHeadline";
import { CircleBadge } from "./CircleBadge";
import { FloatingCard } from "./FloatingCard";
import { HeroAskProvider, ReportButton } from "./hero-ask";
import { HeroScene } from "./HeroScene";

/** Entrance for the text column: each piece fades up a little after the one before. */
const fadeUp = (delay: number) => ({
  className: "animate-[fade-up_0.8s_cubic-bezier(0.2,0.8,0.2,1)_backwards]",
  style: { animationDelay: `${delay}s` },
});

export async function Hero() {
  const [{ t }, waiting] = await Promise.all([getTranslator(), getWaiting()]);
  const period = getDayPeriod();

  return (
    <HeroAskProvider>
      {/* The full-width wrapper clips the drifting colour blobs and floating cards at the screen edge. */}
      <div className="relative isolate overflow-x-clip">
        <div aria-hidden="true" className="absolute -left-24 top-10 -z-10 size-[26rem] animate-[orb-float_14s_ease-in-out_infinite] rounded-full bg-coral/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-20 top-40 -z-10 size-[24rem] animate-[orb-float_18s_ease-in-out_-6s_infinite] rounded-full bg-gold/20 blur-3xl" />

        <section className="hero-grid mx-auto grid max-w-6xl items-center gap-12 px-4 pb-8 pt-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14 md:pb-12 md:pt-16">
          <div className="flex min-w-0 flex-col items-start gap-5">
            <p {...fadeUp(0)} className={`glass inline-flex items-center gap-2 rounded-full py-1.5 pl-3 pr-4 text-[13px] font-bold text-coral-ink dark:text-brownie ${fadeUp(0).className}`}>
              <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
                <span className="absolute size-2.5 animate-ping rounded-full bg-coral/50" />
                <span className="size-2.5 rounded-full bg-coral" />
              </span>
              {t("home.hero.eyebrow")}
            </p>

            <AnimatedHeadline
              text={t("home.hero.title")}
              highlight={t("home.hero.titleHighlight")}
              className="hero-title text-[clamp(36px,6.4vw,70px)] leading-[1.14] tracking-[-0.03em]"
            />

            <p className={`max-w-[48ch] text-[17px] leading-[1.7] text-muted ${fadeUp(0.8).className}`} style={fadeUp(0.8).style}>
              {t("home.hero.subtitle")}
            </p>

            <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap ${fadeUp(1).className}`} style={fadeUp(1).style}>
              <ReportButton label={t("home.reportCta")} />
              <Link href="/map" className="btn btn-ghost !min-h-14">
                <Map size={20} aria-hidden="true" />
                {t("home.hero.secondary")}
              </Link>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
              {(["trust1", "trust2", "trust3"] as const).map((key, i) => (
                <li key={key} className={`flex items-center gap-1.5 ${fadeUp(1.2 + i * 0.12).className}`} style={fadeUp(1.2 + i * 0.12).style}>
                  <Check size={16} className="text-green" aria-hidden="true" />
                  {t(`home.hero.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* The picture, with sonar rings behind it, floating text cards over its edges, and a spinning sticker. */}
          <div className="hero-scene-wrap relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-none">
            {[0, 3].map((delay) => (
              <span
                key={delay}
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -z-10 hidden aspect-square w-[104%] rounded-full border-2 border-coral/25 md:block"
                style={{ animation: `ring-pulse 6s ease-out ${delay}s infinite` }}
              />
            ))}

            <HeroScene period={period} waiting={waiting} />

            <FloatingCard
              icon={Camera}
              tint="bg-coral/12 text-coral-ink dark:text-brownie"
              step={1}
              title={t("home.hero.cards.photo.title")}
              body={t("home.hero.cards.photo.body")}
              position="-top-5 left-[22%] md:left-[16%]"
              delay={1.3}
              bob={5.5}
            />
            <FloatingCard
              icon={MapPin}
              tint="bg-blue/12 text-blue dark:text-[#7ea6f0]"
              step={2}
              title={t("home.hero.cards.pin.title")}
              body={t("home.hero.cards.pin.body")}
              position="-right-3 top-[76%] md:-right-8"
              delay={1.6}
              bob={6.5}
            />
            <FloatingCard
              icon={HandHeart}
              tint="bg-green/12 text-green dark:text-[#4fc3a5]"
              step={3}
              title={t("home.hero.cards.help.title")}
              body={t("home.hero.cards.help.body")}
              position="-left-3 bottom-[3%] md:-left-10"
              delay={1.9}
              bob={7}
            />

            <CircleBadge text={t("home.hero.badge")} label={t("home.reportCta")} className="absolute -right-2 -top-9 z-20 md:-right-6 md:-top-10" />
          </div>
        </section>
      </div>
    </HeroAskProvider>
  );
}
