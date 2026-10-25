"use client";

import { Check, HandHeart, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AreaStep } from "@/components/volunteer/AreaStep";
import { SkillStep } from "@/components/volunteer/SkillStep";
import { useT } from "@/i18n/client";
import { isValidPhone, updateVolunteer, type MyVolunteer, type VolunteerDraft } from "@/lib/volunteers";

const field = "min-h-12 w-full rounded-button border-[1.5px] border-line bg-surface px-4 text-[16px]";

/** The volunteer details, all on one screen so they can be changed any time. Someone who is not a volunteer yet is invited to become one. */
export function VolunteerSettings({ userId, volunteer }: { userId: string; volunteer: MyVolunteer | null }) {
  const t = useT();
  const [draft, setDraft] = useState<VolunteerDraft | null>(volunteer);
  const [active, setActive] = useState(volunteer?.isActive ?? true);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [problem, setProblem] = useState<string | null>(null);

  if (!draft) {
    return (
      <section className="card flex flex-col items-start gap-3 p-5" aria-labelledby="volunteer-title">
        <span className="grid size-11 place-items-center rounded-2xl bg-gold/40 text-[#8a5b00]">
          <HandHeart size={22} aria-hidden="true" />
        </span>
        <h2 id="volunteer-title" className="text-xl">
          {t("profile.volunteer.none")}
        </h2>
        <p className="text-muted">{t("profile.volunteer.noneBody")}</p>
        <Link href="/volunteer" className="btn btn-primary">
          {t("profile.volunteer.join")}
        </Link>
      </section>
    );
  }

  const update = (patch: Partial<VolunteerDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setState("idle");
    setProblem(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "saving") return;
    if (draft.skills.length === 0) return setProblem(t("volunteer.error.needSkill"));
    if (!draft.area.trim()) return setProblem(t("volunteer.error.needArea"));
    if (!draft.name.trim()) return setProblem(t("volunteer.error.needName"));
    if (!isValidPhone(draft.phone)) return setProblem(t("volunteer.error.needPhone"));
    setProblem(null);
    setState("saving");
    setState((await updateVolunteer(userId, draft, active)) ? "saved" : "error");
  };

  return (
    <section className="card flex flex-col gap-5 p-5" aria-labelledby="volunteer-title">
      <div className="flex flex-col gap-1">
        <h2 id="volunteer-title" className="text-xl">
          {t("profile.volunteer.title")}
        </h2>
        <p className="text-sm text-muted">{t("profile.volunteer.intro")}</p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6" noValidate>
        {/* available right now: a switch */}
        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-card bg-linear-to-br from-green/12 to-gold/10 p-4">
          <span className="flex flex-col">
            <strong className="font-heading">{t("profile.volunteer.active")}</strong>
            <span className="text-sm text-muted">{t("profile.volunteer.activeHint")}</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={active}
            onChange={(e) => {
              setActive(e.target.checked);
              setState("idle");
            }}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-8 w-14 shrink-0 rounded-full bg-line transition duration-200 peer-checked:bg-green peer-focus-visible:outline-3 peer-focus-visible:outline-blue after:absolute after:left-1 after:top-1 after:size-6 after:rounded-full after:bg-white after:shadow-soft after:transition after:duration-200 peer-checked:after:translate-x-6"
          />
        </label>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg">{t("profile.volunteer.skills")}</h3>
          <SkillStep value={draft.skills} onChange={(skills) => update({ skills })} error={null} />
        </div>

        <AreaStep
          area={draft.area}
          position={draft.lat !== null && draft.lng !== null ? { lat: draft.lat, lng: draft.lng } : null}
          radiusKm={draft.radiusKm}
          error={null}
          onArea={(area) => update({ area })}
          onPosition={(p) => update({ lat: p.lat, lng: p.lng })}
          onRadius={(radiusKm) => update({ radiusKm })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">{t("volunteer.you.name")}</span>
            <input type="text" value={draft.name} maxLength={100} autoComplete="name" onChange={(e) => update({ name: e.target.value })} className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">{t("volunteer.you.phone")}</span>
            <input type="tel" inputMode="tel" value={draft.phone} maxLength={20} autoComplete="tel" onChange={(e) => update({ phone: e.target.value })} className={field} />
          </label>
        </div>
        <p className="-mt-3 text-sm text-muted">{t("volunteer.you.phoneHint")}</p>

        {problem && (
          <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
            {problem}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={state === "saving"}>
            {state === "saving" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
            {state === "saving" ? t("profile.account.saving") : t("profile.volunteer.save")}
          </button>
          {state === "saved" && (
            <p role="status" className="flex items-center gap-1.5 text-sm font-semibold text-green dark:text-[#4fc3a5]">
              <Check size={16} strokeWidth={3} aria-hidden="true" />
              {t("profile.account.saved")}
            </p>
          )}
          {state === "error" && (
            <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
              {t("profile.account.error")}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
