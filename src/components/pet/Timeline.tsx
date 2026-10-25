import { Flag, HandHelping, House, MessageCircle, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { ReportKind } from "@/lib/domain";
import { agoLabel } from "@/lib/pet-text";
import type { TimelineEntry } from "@/lib/pet-detail";
import { statusColor } from "@/lib/pets";

const look: Record<ReportKind, { icon: LucideIcon; color: string }> = {
  reported: { icon: Flag, color: statusColor.reported },
  help_on_the_way: { icon: HandHelping, color: statusColor.help_on_the_way },
  safe: { icon: ShieldCheck, color: statusColor.safe },
  adopted: { icon: Sparkles, color: statusColor.adopted },
  update: { icon: MessageCircle, color: "#6b7280" },
  offer_help: { icon: HandHelping, color: statusColor.help_on_the_way },
  offer_home: { icon: House, color: statusColor.safe },
};

/** What has happened to this animal, newest first: each report, offer of help, update and status change. */
export async function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { t } = await getTranslator();

  return (
    <section className="card flex flex-col gap-4 p-5" aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="text-xl">
        {t("pet.timeline.title")}
      </h2>
      <ol className="flex flex-col">
        {entries.map((entry, i) => {
          const { icon: Icon, color } = look[entry.kind];
          const name = entry.author_name ?? t("pet.timeline.someone");
          return (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < entries.length - 1 && <span aria-hidden="true" className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 rounded-full bg-line" />}
              <span aria-hidden="true" className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-white" style={{ background: color, color: entry.kind === "adopted" ? "#182033" : "#fff" }}>
                <Icon size={17} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                <p className="font-semibold leading-snug [overflow-wrap:anywhere]">{t(`pet.timeline.${entry.kind}`, { name })}</p>
                <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  {agoLabel(t, entry.created_at)}
                  {entry.help_type && (
                    <span className="rounded-full bg-blue/12 px-2 py-0.5 text-xs font-bold text-blue dark:bg-blue/25 dark:text-white">{t(`pet.help.type.${entry.help_type}`)}</span>
                  )}
                </p>
                {entry.note && entry.kind !== "reported" && (
                  <p className="mt-1 rounded-2xl rounded-tl-md bg-cream/70 px-3 py-2 text-[15px] [overflow-wrap:anywhere] dark:bg-foreground/8">{entry.note}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
