import { Check } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { petStatuses, type PetStatus } from "@/lib/domain";
import { statusColor } from "@/lib/pets";

/** The four steps of the status flow as a path: finished steps are filled, the current one pulses. */
export async function StatusJourney({ status }: { status: PetStatus }) {
  const { t } = await getTranslator();
  const current = petStatuses.indexOf(status);

  return (
    <section className="card flex flex-col gap-4 p-5" aria-labelledby="journey-title">
      <h2 id="journey-title" className="text-xl">
        {t("pet.journey.title")}
      </h2>
      <ol className="flex flex-col">
        {petStatuses.map((step, i) => {
          const done = i < current;
          const here = i === current;
          const color = statusColor[step];
          const last = i === petStatuses.length - 1;
          return (
            <li key={step} aria-current={here ? "step" : undefined} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full"
                  style={{ background: done ? color : "var(--line)" }}
                />
              )}
              <span
                aria-hidden="true"
                className="relative grid size-8 shrink-0 place-items-center rounded-full border-2 text-white"
                style={{
                  background: done || here ? color : "transparent",
                  borderColor: done || here ? color : "var(--line)",
                  color: step === "adopted" && (done || here) ? "#182033" : "#fff",
                }}
              >
                {here && <span className="absolute -inset-1.5 animate-[halo_2.2s_ease-out_infinite] rounded-full border-2" style={{ borderColor: color }} />}
                {done ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-extrabold">{i + 1}</span>}
              </span>
              <div className={`flex min-w-0 flex-col pt-0.5 ${done || here ? "" : "opacity-60"}`}>
                <strong className="font-heading text-base leading-tight">{t(`status.${step}`)}</strong>
                <span className="text-sm text-muted">{t(`pet.journey.${step}`)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
