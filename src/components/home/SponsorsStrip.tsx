import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { sponsors } from "@/lib/sponsors";

const PLACEHOLDER_SLOTS = 6;

/**
 * A slowly scrolling strip of partner logos. With no partners yet it shows marked, empty slots
 * (never made-up logos). The strip pauses when you point at it.
 */
export async function SponsorsStrip() {
  const { t } = await getTranslator();
  const hasSponsors = sponsors.length > 0;

  const tiles = hasSponsors
    ? sponsors.map((s) => {
        const logo = (
          // eslint-disable-next-line @next/next/no-img-element -- small partner logos served from /public
          <img src={s.logo} alt={s.name} loading="lazy" className="h-9 w-auto max-w-[9rem] object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
        );
        return s.href ? (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="group flex h-16 shrink-0 items-center px-8">
            {logo}
          </a>
        ) : (
          <span key={s.name} className="group flex h-16 shrink-0 items-center px-8">
            {logo}
          </span>
        );
      })
    : Array.from({ length: PLACEHOLDER_SLOTS }, (_, i) => (
        <span
          key={i}
          className="mx-3 flex h-16 w-44 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted"
        >
          <Plus size={16} aria-hidden="true" />
          {t("sponsors.slot")}
        </span>
      ));

  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 pt-6">
      <div className="card flex flex-col gap-5 overflow-hidden px-0 py-6 md:flex-row md:items-center md:gap-8 md:px-8">
        <div className="shrink-0 px-6 md:max-w-[15rem] md:px-0">
          <p className="eyebrow">{t("sponsors.eyebrow")}</p>
          <h2 className="mt-2 text-xl leading-snug">{t("sponsors.title")}</h2>
          <Link href="/about" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-coral-ink hover:underline dark:text-brownie">
            {t("sponsors.cta")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Two identical copies side by side, moved left by half their width: an endless loop with no jump. */}
        <div className="group relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max animate-[marquee_36s_linear_infinite] group-hover:[animation-play-state:paused]">
            <div className="flex shrink-0 items-center">{tiles}</div>
            <div className="flex shrink-0 items-center" aria-hidden="true">
              {tiles}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
