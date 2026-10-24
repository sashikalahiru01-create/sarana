"use client";

import { AlertTriangle, Cat, Dog } from "lucide-react";
import { animalTypes, isUrgent, petConditions, type AnimalType } from "@/lib/domain";
import { useT } from "@/i18n/client";

type Props = {
  animal: AnimalType | null;
  conditions: string[];
  note: string;
  contact: string;
  honeypot: string;
  error: string | null;
  onAnimal: (animal: AnimalType) => void;
  onToggleCondition: (condition: string) => void;
  onNote: (note: string) => void;
  onContact: (contact: string) => void;
  onHoneypot: (value: string) => void;
};

const chip = (on: boolean) =>
  `min-h-11 max-w-full rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition duration-200 active:scale-95 ${
    on ? "border-midnight bg-midnight text-white dark:border-cream dark:bg-cream dark:text-midnight" : "border-line bg-surface"
  }`;

const field = "rounded-button border-[1.5px] border-line bg-surface px-4";

export function DetailsStep(p: Props) {
  const t = useT();

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">{t("report.details.type")}</legend>
        <div className="grid grid-cols-2 gap-3">
          {animalTypes.map((type) => {
            const on = p.animal === type;
            const Icon = type === "dog" ? Dog : Cat;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={on}
                onClick={() => p.onAnimal(type)}
                className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-card border-2 text-lg font-bold transition duration-200 active:scale-95 ${
                  on ? "border-coral bg-coral/10 text-coral-ink dark:text-brownie" : "border-line bg-surface"
                }`}
              >
                <Icon size={28} aria-hidden="true" />
                {t(`report.details.${type}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">{t("report.details.conditions")}</legend>
        <div className="flex flex-wrap gap-2">
          {petConditions.map((c) => (
            <button key={c} type="button" aria-pressed={p.conditions.includes(c)} className={chip(p.conditions.includes(c))} onClick={() => p.onToggleCondition(c)}>
              {t(`report.condition.${c}`)}
            </button>
          ))}
        </div>
        {isUrgent(p.conditions) && (
          <p role="status" className="mt-1 flex items-center gap-2 rounded-button bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-ink dark:text-brownie">
            <AlertTriangle size={18} className="shrink-0" aria-hidden="true" />
            {t("report.details.urgent")}
          </p>
        )}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t("report.details.noteLabel")}</span>
        <textarea
          value={p.note}
          maxLength={1000}
          rows={3}
          onChange={(e) => p.onNote(e.target.value)}
          placeholder={t("report.details.notePlaceholder")}
          className={`${field} py-3`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t("report.details.contactLabel")}</span>
        <input
          type="text"
          inputMode="email"
          autoComplete="off"
          maxLength={200}
          value={p.contact}
          onChange={(e) => p.onContact(e.target.value)}
          className={`${field} min-h-12`}
        />
        <span className="text-sm text-muted">{t("report.details.contactHint")}</span>
      </label>

      {/* Honeypot: invisible to people, tempting to bots. A filled value means a bot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={p.honeypot} onChange={(e) => p.onHoneypot(e.target.value)} />
        </label>
      </div>

      {p.error && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {p.error}
        </p>
      )}
    </div>
  );
}
