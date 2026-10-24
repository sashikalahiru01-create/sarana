"use client";

import { Bone, Car, Check, House, Stethoscope, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/client";
import { volunteerSkills, type VolunteerSkill } from "@/lib/domain";

const looks: Record<VolunteerSkill, { icon: LucideIcon; tint: string; on: string }> = {
  feeding: { icon: Bone, tint: "bg-coral/12 text-coral-ink dark:text-brownie", on: "border-coral" },
  transport: { icon: Car, tint: "bg-blue/12 text-blue dark:text-[#7ea6f0]", on: "border-blue" },
  foster: { icon: House, tint: "bg-green/12 text-green dark:text-[#4fc3a5]", on: "border-green" },
  vet_care: { icon: Stethoscope, tint: "bg-gold/25 text-[#8a5b00] dark:text-gold", on: "border-gold" },
};

/** Four big cards. Each one lifts and shows a tick when chosen. */
export function SkillStep({ value, onChange, error }: { value: VolunteerSkill[]; onChange: (skills: VolunteerSkill[]) => void; error: string | null }) {
  const t = useT();
  const toggle = (skill: VolunteerSkill) => onChange(value.includes(skill) ? value.filter((s) => s !== skill) : [...value, skill]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">{t("volunteer.skills.hint")}</p>

      <div role="group" aria-label={t("volunteer.skills.title")} className="grid grid-cols-2 gap-3">
        {volunteerSkills.map((skill) => {
          const { icon: Icon, tint, on } = looks[skill];
          const chosen = value.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              aria-pressed={chosen}
              onClick={() => toggle(skill)}
              className={`relative flex min-h-36 flex-col items-start gap-3 rounded-card border-2 p-4 text-left transition duration-300 ease-spring active:scale-95 ${
                chosen ? `${on} -translate-y-1 bg-surface shadow-pop` : "border-line bg-surface/70 hover:-translate-y-0.5 hover:shadow-soft"
              }`}
            >
              <span className={`grid size-12 place-items-center rounded-2xl transition duration-300 ${tint} ${chosen ? "scale-110 -rotate-6" : ""}`}>
                <Icon size={24} aria-hidden="true" />
              </span>
              <span>
                <strong className="block font-heading text-lg leading-tight">{t(`volunteer.skills.${skill}.title`)}</strong>
                <span className="text-sm text-muted">{t(`volunteer.skills.${skill}.body`)}</span>
              </span>
              <span
                aria-hidden="true"
                className={`absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-green text-white transition duration-300 ease-spring ${chosen ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {error}
        </p>
      )}
    </div>
  );
}
