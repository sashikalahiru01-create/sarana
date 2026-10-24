import { Camera, PawPrint } from "lucide-react";
import Link from "next/link";
import { ReplayButton } from "@/components/story/ReplayButton";
import { getTranslator } from "@/i18n/server";
import { GuideTitle } from "./GuideTitle";

/**
 * Night-sky call to action that closes a page. On /story the second button replays the story;
 * on the home page it leads to the story.
 */
export async function ClosingPanel({ variant }: { variant: "story" | "home" }) {
  const { t } = await getTranslator();
  const secondary = "btn border-[1.5px] border-white/25 bg-white/10 text-cream hover:bg-white/15";

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 pt-12">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-linear-to-br from-midnight to-night p-8 text-cream shadow-pop sm:p-12">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-80 rounded-full bg-coral/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-1/3 -z-10 size-72 rounded-full bg-gold/15 blur-3xl" />
        <PawPrint aria-hidden="true" size={190} strokeWidth={1.25} className="absolute -bottom-6 right-4 -z-10 -rotate-12 text-white/8" />

        <GuideTitle pose="door" say={t("guide.door")} className="mt-0 text-[clamp(30px,4.6vw,54px)] tracking-[-0.03em]" underline="text-gold">
          {t("home.title")}
        </GuideTitle>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.7] text-cream/80">{t("home.subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/report" className="btn btn-primary !min-h-14">
            <Camera size={20} aria-hidden="true" />
            {t("home.reportCta")}
          </Link>
          {variant === "story" ? (
            <ReplayButton className={secondary} />
          ) : (
            <Link href="/story" className={secondary}>
              {t("home.watchStory")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
