import { HandHeart, House, PawPrint, ShieldCheck, type LucideIcon } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { GuideTitle } from "./GuideTitle";

type Stats = { reported: number; helped: number; adopted: number; volunteers: number };

const tiles: { key: keyof Stats; icon: LucideIcon; tint: string }[] = [
  { key: "reported", icon: PawPrint, tint: "bg-coral/12 text-coral-ink dark:text-brownie" },
  { key: "helped", icon: ShieldCheck, tint: "bg-green/12 text-green dark:text-[#4fc3a5]" },
  { key: "adopted", icon: House, tint: "bg-gold/20 text-[#8a5b00] dark:text-gold" },
  { key: "volunteers", icon: HandHeart, tint: "bg-blue/12 text-blue dark:text-[#7ea6f0]" },
];

async function loadStats(): Promise<Stats | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_stats");
    return error ? null : (data as Stats);
  } catch {
    return null; // the home page works without the numbers
  }
}

/** Live numbers from the database. Renders nothing if they cannot be loaded. */
export async function StatsStrip() {
  const [{ t }, stats] = await Promise.all([getTranslator(), loadStats()]);
  if (!stats) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pt-12">
      <GuideTitle pose="proud" say={t("guide.stats")} eyebrow={t("home.stats.eyebrow")} className="text-[clamp(26px,3.8vw,40px)]">
        {t("home.stats.title")}
      </GuideTitle>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(({ key, icon: Icon, tint }) => (
          <div key={key} className="card flex flex-col gap-3 p-5">
            <span className={`grid size-10 place-items-center rounded-xl ${tint}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            <dd className="order-first font-heading text-5xl font-extrabold tabular-nums tracking-tight">{stats[key]}</dd>
            <dt className="text-sm font-semibold text-muted">{t(`home.stats.${key}`)}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function StatsSkeleton() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12" aria-hidden="true">
      <div className="shimmer h-4 w-24 rounded" />
      <div className="shimmer mt-4 h-8 w-72 max-w-full rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="shimmer h-36 rounded-card" />
        ))}
      </div>
    </section>
  );
}
