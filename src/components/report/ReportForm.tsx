"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PawConfetti } from "@/components/ui/PawConfetti";
import { PawProgress } from "@/components/ui/PawProgress";
import { useT } from "@/i18n/client";
import { MAX_PHOTOS, type AnimalType } from "@/lib/domain";
import { compressImage } from "@/lib/image";
import { ReportError, submitReport, type ReportProgress } from "@/lib/reports";
import { DetailsStep } from "./DetailsStep";
import type { LatLng } from "./LocationMap";
import { LocationStep } from "./LocationStep";
import { PhotoStep, type Photo } from "./PhotoStep";
import { Stepper } from "./Stepper";

const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "sarana_last_report";

type Done = { id: string | null };

export function ReportForm() {
  const t = useT();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [animal, setAnimal] = useState<AnimalType | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<ReportProgress>({ stage: "upload", value: 0 });
  const [done, setDone] = useState<Done | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Move focus to the step heading so screen readers announce the new step.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [step, done]);

  // Free the preview URLs when leaving the page.
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addPhotos = async (files: File[]) => {
    setError(null);
    setPhotoBusy(true);
    try {
      const room = Math.max(0, MAX_PHOTOS - photosRef.current.length);
      const added: Photo[] = [];
      for (const file of files.slice(0, room)) {
        const blob = await compressImage(file);
        added.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
      }
      setPhotos((current) => [...current, ...added]);
    } catch {
      setError(t("report.photo.readError"));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      current.filter((p) => p.id === id).forEach((p) => URL.revokeObjectURL(p.url));
      return current.filter((p) => p.id !== id);
    });
  };

  const toggleCondition = (c: string) =>
    setConditions((current) => (current.includes(c) ? current.filter((x) => x !== c) : [...current, c]));

  const next = () => {
    if (step === 0 && photos.length === 0) return setError(t("report.error.needPhoto"));
    if (step === 1 && !position) return setError(t("report.error.needLocation"));
    setError(null);
    setStep(step + 1);
  };

  const back = () => {
    setError(null);
    setStep(step - 1);
  };

  const submit = async () => {
    if (submitting) return;
    if (!animal) return setError(t("report.error.needType"));
    if (!position) return;

    // A filled honeypot means a bot: pretend it worked and send nothing.
    if (honeypot) return setDone({ id: null });

    try {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
      if (Date.now() - last < COOLDOWN_MS) return setError(t("report.error.tooFast"));
    } catch {
      // storage can be blocked; the cooldown is only a nicety
    }

    setError(null);
    setSubmitting(true);
    setProgress({ stage: "upload", value: 0.02 });
    // On phones the progress bar sits below the fold; bring it into view once it has rendered.
    requestAnimationFrame(() => progressRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
    try {
      const id = await submitReport(
        {
          animalType: animal,
          conditions,
          note,
          contact,
          lat: position.lat,
          lng: position.lng,
          locationLabel,
          photos: photos.map((p) => p.blob),
        },
        setProgress,
      );
      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {}
      setDone({ id });
    } catch (e) {
      setError(e instanceof ReportError && e.code === "upload" ? t("report.error.upload") : t("report.error.save"));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setPosition(null);
    setLocationLabel("");
    setAnimal(null);
    setConditions([]);
    setNote("");
    setContact("");
    setError(null);
    setProgress({ stage: "upload", value: 0 });
    setStep(0);
    setDone(null);
  };

  if (done) {
    return (
      <div className="card relative flex flex-col items-center gap-4 overflow-hidden p-8 text-center">
        <PawConfetti />
        <CheckCircle2 size={56} className="text-green" aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1} className="text-3xl outline-none">
          {t("report.success.title")}
        </h2>
        <p className="text-muted">{t("report.success.body")}</p>
        <div className="mt-2 flex w-full flex-col gap-3">
          {done.id && (
            <Link href={`/pet/${done.id}`} className="btn btn-primary">
              {t("report.success.view")}
            </Link>
          )}
          <Link href="/map" className="btn btn-ghost">
            {t("report.success.map")}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            {t("report.success.another")}
          </button>
        </div>
      </div>
    );
  }

  const titles = ["report.photo.title", "report.location.title", "report.details.title"] as const;
  const last = step === 2;

  return (
    <div className="flex flex-col gap-6">
      <Stepper
        label={t("report.stepsLabel")}
        current={step}
        steps={[t("report.steps.photo"), t("report.steps.location"), t("report.steps.details")]}
      />

      <section className="card flex flex-col gap-5 p-5">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t(titles[step])}
        </h2>

        {step === 0 && <PhotoStep photos={photos} busy={photoBusy} error={error} onAdd={addPhotos} onRemove={removePhoto} />}
        {step === 1 && <LocationStep position={position} label={locationLabel} onPosition={setPosition} onLabel={setLocationLabel} />}
        {step === 2 && (
          <DetailsStep
            animal={animal}
            conditions={conditions}
            note={note}
            contact={contact}
            honeypot={honeypot}
            error={error}
            onAnimal={setAnimal}
            onToggleCondition={toggleCondition}
            onNote={setNote}
            onContact={setContact}
            onHoneypot={setHoneypot}
          />
        )}
        {step === 1 && error && (
          <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
            {error}
          </p>
        )}

        {submitting && (
          <div ref={progressRef} className="flex flex-col gap-2">
            <PawProgress value={progress.value} label={t(`report.progress.${progress.stage}`)} />
            <p className="text-center text-sm text-muted">{t(`report.progress.${progress.stage}`)}</p>
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={back} disabled={submitting}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t("report.nav.back")}
            </button>
          )}
          {last ? (
            <button type="button" className="btn btn-primary flex-1" onClick={submit} disabled={submitting || photoBusy}>
              {submitting ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
              {submitting ? t("report.nav.sending") : t("report.nav.submit")}
            </button>
          ) : (
            <button type="button" className="btn btn-primary flex-1" onClick={next} disabled={photoBusy}>
              {t("report.nav.next")}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
