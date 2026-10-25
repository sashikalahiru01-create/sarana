"use client";

import { ArrowLeft, ArrowRight, Loader2, LogIn, PawPrint } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Stepper } from "@/components/report/Stepper";
import { PawConfetti } from "@/components/ui/PawConfetti";
import { useT } from "@/i18n/client";
import type { VolunteerSkill } from "@/lib/domain";
import { clearDraft, isValidPhone, loadDraft, saveDraft, submitVolunteer, type VolunteerDraft } from "@/lib/volunteers";
import { AreaStep } from "./AreaStep";
import { CollarTag } from "./CollarTag";
import { SkillStep } from "./SkillStep";

type Done = { name: string; area: string; skills: VolunteerSkill[] };

const subscribeNothing = () => () => {};

/** The form reads the saved draft from the phone, so it only renders in the browser. A shimmer holds its place until then. */
export function VolunteerForm() {
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  if (!mounted) return <div className="shimmer h-96 rounded-card" aria-hidden="true" />;
  return <FormInner />;
}

function FormInner() {
  const t = useT();
  const [draft, setDraft] = useState<VolunteerDraft>(loadDraft);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const update = (patch: Partial<VolunteerDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      saveDraft(next);
      return next;
    });
    setError(null);
  };

  // Move focus to the step heading so screen readers announce the new step.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [step, done, needLogin]);

  const checkStep = (): string | null => {
    if (step === 0 && draft.skills.length === 0) return t("volunteer.error.needSkill");
    if (step === 1 && !draft.area.trim()) return t("volunteer.error.needArea");
    if (step === 2) {
      if (!draft.name.trim()) return t("volunteer.error.needName");
      if (!isValidPhone(draft.phone)) return t("volunteer.error.needPhone");
    }
    return null;
  };

  const next = () => {
    const problem = checkStep();
    if (problem) return setError(problem);
    setError(null);
    setStep(step + 1);
  };

  const submit = async () => {
    if (submitting) return;
    const problem = checkStep();
    if (problem) return setError(problem);
    setError(null);
    setNeedLogin(false);
    setSubmitting(true);
    try {
      const result = await submitVolunteer(draft);
      if (result.status === "login") return setNeedLogin(true);
      if (result.status === "already") return setError(t("volunteer.error.already"));
      if (result.status === "error") return setError(t("volunteer.error.save"));
      clearDraft();
      setDone({ name: draft.name.trim(), area: draft.area.trim(), skills: draft.skills });
    } catch {
      setError(t("volunteer.error.save"));
    } finally {
      setSubmitting(false);
    }
  };

  const skillNames = (skills: VolunteerSkill[]) => skills.map((s) => t(`volunteer.skills.${s}.title`));

  if (done) {
    return (
      <div className="card relative flex flex-col items-center gap-5 overflow-hidden p-6 text-center sm:p-8">
        <PawConfetti />
        {/* Brownie is already in the page header; a second one here would make two */}
        <h2 ref={headingRef} tabIndex={-1} className="text-3xl outline-none">
          {t("volunteer.success.title", { name: done.name })}
        </h2>
        <p className="max-w-[40ch] text-muted">{t("volunteer.success.body", { area: done.area })}</p>
        <CollarTag name={done.name} role={t("volunteer.success.tag")} skills={skillNames(done.skills)} />
        <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/map" className="btn btn-primary">
            {t("volunteer.success.map")}
          </Link>
          <Link href="/" className="btn btn-ghost">
            {t("volunteer.success.home")}
          </Link>
        </div>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="card flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t("volunteer.gate.title")}
        </h2>
        <p className="max-w-[38ch] text-muted">{t("volunteer.gate.body")}</p>
        <Link href={`/join?next=${encodeURIComponent("/volunteer")}`} className="btn btn-primary">
          <LogIn size={18} aria-hidden="true" />
          {t("volunteer.gate.login")}
        </Link>
        <button type="button" className="btn btn-ghost" onClick={() => setNeedLogin(false)}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t("volunteer.nav.back")}
        </button>
      </div>
    );
  }

  const titles = ["volunteer.skills.title", "volunteer.area.title", "volunteer.you.title"] as const;
  const last = step === 2;
  const field = "min-h-12 rounded-button border-[1.5px] border-line bg-surface px-4";

  return (
    <div className="flex flex-col gap-6">
      <Stepper
        label={t("volunteer.stepsLabel")}
        current={step}
        steps={[t("volunteer.steps.skills"), t("volunteer.steps.area"), t("volunteer.steps.you")]}
      />

      <section className="card flex flex-col gap-5 p-5">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t(titles[step])}
        </h2>

        {step === 0 && <SkillStep value={draft.skills} onChange={(skills) => update({ skills })} error={error} />}

        {step === 1 && (
          <AreaStep
            area={draft.area}
            position={draft.lat !== null && draft.lng !== null ? { lat: draft.lat, lng: draft.lng } : null}
            radiusKm={draft.radiusKm}
            error={error}
            onArea={(area) => update({ area })}
            onPosition={(p) => update({ lat: p.lat, lng: p.lng })}
            onRadius={(radiusKm) => update({ radiusKm })}
          />
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-semibold">{t("volunteer.you.name")}</span>
              <input type="text" value={draft.name} maxLength={100} autoComplete="name" onChange={(e) => update({ name: e.target.value })} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-semibold">{t("volunteer.you.phone")}</span>
              <input
                type="tel"
                inputMode="tel"
                value={draft.phone}
                maxLength={20}
                autoComplete="tel"
                onChange={(e) => update({ phone: e.target.value })}
                className={field}
              />
              <span className="text-sm text-muted">{t("volunteer.you.phoneHint")}</span>
            </label>

            <div>
              <p className="mb-1 text-sm font-semibold text-muted">{t("volunteer.you.summary")}</p>
              <div className="flex flex-wrap items-center gap-2 rounded-card bg-linear-to-br from-gold/25 to-coral/10 p-4">
                <PawPrint size={18} className="text-coral-ink dark:text-brownie" aria-hidden="true" />
                <strong className="font-heading">{draft.name.trim() || "…"}</strong>
                <span className="text-sm text-muted">· {draft.area.trim()}</span>
                <span className="w-full text-sm font-semibold text-foreground/80">{skillNames(draft.skills).join(" · ")}</span>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={submitting}
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              {t("volunteer.nav.back")}
            </button>
          )}
          {last ? (
            <button type="button" className="btn btn-primary flex-1" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <PawPrint size={20} aria-hidden="true" />}
              {submitting ? t("volunteer.nav.sending") : t("volunteer.nav.submit")}
            </button>
          ) : (
            <button type="button" className="btn btn-primary flex-1" onClick={next}>
              {t("volunteer.nav.next")}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
