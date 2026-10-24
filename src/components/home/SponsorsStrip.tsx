import { ArrowUpRight, PawPrint, Plus } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getTranslator } from "@/i18n/server";
import { sponsors } from "@/lib/sponsors";

const PLACEHOLDER_SLOTS = 7;

/**
 * Partners hang on a rope as gold collar tags, like the one on Brownie's collar. They drop in when the
 * section scrolls into view, swing gently, and the whole rope slides slowly past (pausing when you
 * point at it). With no partners yet the tags are clearly empty slots, never made-up logos.
 */
export async function SponsorsStrip() {
  const { t } = await getTranslator();
  const hasSponsors = sponsors.length > 0;

  const slots = hasSponsors ? sponsors.map((s) => ({ key: s.name, sponsor: s })) : Array.from({ length: PLACEHOLDER_SLOTS }, (_, i) => ({ key: `slot-${i}`, sponsor: null }));

  const tags = slots.map(({ key, sponsor }, i) => {
    const plate = sponsor ? (
      // eslint-disable-next-line @next/next/no-img-element -- small partner logos served from /public
      <img src={sponsor.logo} alt={sponsor.name} loading="lazy" className="h-10 w-auto max-w-[8.5rem] object-contain" />
    ) : (
      <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#7a4d00]">
        <Plus size={15} aria-hidden="true" />
        {t("sponsors.slot")}
      </span>
    );

    const tag = (
      <span className="relative block rounded-[22px] bg-linear-to-b from-[#ffd778] via-[#f2b544] to-[#dd9420] p-[7px] shadow-[0_14px_22px_-12px_rgb(120_70_10/0.7),inset_0_1px_0_rgb(255_255_255/0.6)] transition duration-300 ease-spring group-hover/tag:-translate-y-1.5 group-hover/tag:scale-105">
        <span aria-hidden="true" className="absolute left-1/2 top-2.5 size-3 -translate-x-1/2 rounded-full bg-[#b87413]/70 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)]" />
        <span
          className={`mt-6 grid h-[4.25rem] w-44 place-items-center rounded-2xl border border-[#b87413]/25 ${
            sponsor ? "bg-white" : "border-dashed bg-white/55"
          }`}
        >
          {plate}
        </span>
      </span>
    );

    return (
      <li key={key} className="reveal-tag group/tag relative mx-3.5 shrink-0 pt-9" style={{ animationDelay: `${i * 0.12}s` }}>
        {/* the string the tag hangs from */}
        <span aria-hidden="true" className="absolute left-1/2 top-[1.15rem] h-6 w-px -translate-x-1/2 bg-[#8a5b2b]/70" />
        <span
          className="block origin-top animate-[tag-swing_6s_ease-in-out_infinite]"
          style={{ animationDuration: `${5 + (i % 3)}s`, animationDelay: `${-i * 0.9}s` }}
        >
          {sponsor?.href ? (
            <a href={sponsor.href} target="_blank" rel="noopener noreferrer" title={sponsor.name} className="block">
              {tag}
            </a>
          ) : (
            tag
          )}
        </span>
      </li>
    );
  });

  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 pt-6">
      <Reveal className="relative isolate overflow-hidden rounded-[32px] border border-[#f0d3a2] bg-linear-to-br from-[#fff4e0] via-[#fde4bd] to-[#f8d29d] shadow-pop dark:border-white/10 dark:from-[#1d2547] dark:via-[#182033] dark:to-[#111936]">
        {/* warm light and drifting paw prints */}
        <div aria-hidden="true" className="absolute -left-16 -top-20 -z-10 size-72 animate-[orb-float_16s_ease-in-out_infinite] rounded-full bg-gold/35 blur-3xl dark:bg-coral/20" />
        <div aria-hidden="true" className="absolute -bottom-24 right-10 -z-10 size-64 animate-[orb-float_20s_ease-in-out_-8s_infinite] rounded-full bg-coral/15 blur-3xl" />
        <PawPrint aria-hidden="true" size={120} strokeWidth={1.2} className="absolute -bottom-4 left-[30%] -z-10 -rotate-12 animate-[bob_7s_ease-in-out_infinite] text-[#b87413]/10 dark:text-white/5" />
        <PawPrint aria-hidden="true" size={72} strokeWidth={1.2} className="absolute right-[8%] top-3 -z-10 rotate-12 animate-[bob_9s_ease-in-out_-3s_infinite] text-[#b87413]/10 dark:text-white/5" />
        <div aria-hidden="true" className="story-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.05]" />

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-10 md:px-10">
          <div className="shrink-0 px-6 pt-8 md:max-w-[19rem] md:px-0 md:py-10">
            <p className="glass inline-flex items-center gap-2 rounded-full py-1 pl-2.5 pr-3.5 text-xs font-bold uppercase tracking-[0.12em] text-coral-ink dark:text-brownie">
              <PawPrint size={14} aria-hidden="true" />
              {t("sponsors.eyebrow")}
            </p>
            <h2 className="mt-4 text-[clamp(24px,3vw,32px)] leading-[1.2]">{hasSponsors ? t("sponsors.title") : t("sponsors.emptyTitle")}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6b5a3a] dark:text-cream/70">{t("sponsors.body")}</p>
            <Link href="/about" className="btn btn-primary mt-5 !min-h-12 !px-5">
              {t("sponsors.cta")}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>

          {/* The rope. Two identical copies side by side, moved left by half their width: an endless loop with no jump. */}
          <div className="group relative min-w-0 flex-1 overflow-hidden pb-8 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:py-6">
            <div className="relative flex w-max animate-[marquee_44s_linear_infinite] group-hover:[animation-play-state:paused]">
              <span aria-hidden="true" className="absolute inset-x-0 top-[1.1rem] h-[3px] rounded-full bg-linear-to-b from-[#a8672a] to-[#7a4a1c] shadow-[0_2px_3px_rgb(0_0_0/0.25)]" />
              <ul className="flex shrink-0 items-start">{tags}</ul>
              <ul className="flex shrink-0 items-start" aria-hidden="true">
                {tags}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
