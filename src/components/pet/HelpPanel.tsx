"use client";

import { HandHelping, House, Loader2, LogIn, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Brownie } from "@/components/brownie/Brownie";
import { PawConfetti } from "@/components/ui/PawConfetti";
import { useT } from "@/i18n/client";
import { helpTypes, petStatuses, type HelpType, type PetStatus, type ReportKind } from "@/lib/domain";
import { statusColor } from "@/lib/pets";
import { createClient } from "@/lib/supabase/client";

type Mode = "help" | "home" | "update";
type Problem = "pick" | "note" | "send";

type Props = {
  petId: string;
  status: PetStatus;
  /** The logged-in person, or null. Adding to the timeline needs a login. */
  userId: string | null;
  /** Volunteers and admins can also move the animal to the next steps of the status flow. */
  canSetStatus: boolean;
  loginHref: string;
  offers: number;
  homes: number;
};

const fieldClass = "min-h-12 w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-3 text-base placeholder:text-muted/70 focus:border-coral";

/** "Can you help?": the three ways to join in. Each opens a small form right here; the result lands on the timeline. */
export function HelpPanel({ petId, status, userId, canSetStatus, loginHref, offers, homes }: Props) {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [helpType, setHelpType] = useState<HelpType | null>(null);
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState<PetStatus | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const sending = useRef(false);

  const later = petStatuses.slice(petStatuses.indexOf(status) + 1);

  const open = (next: Mode) => {
    setMode(next);
    setProblem(null);
    setSent(false);
  };
  const close = () => {
    setMode(null);
    setHelpType(null);
    setNote("");
    setNewStatus(null);
    setProblem(null);
    setSent(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending.current || !userId || !mode) return;
    const text = note.trim();
    if (mode === "help" && !helpType) return setProblem("pick");
    if (mode === "update" && !newStatus && text.length < 2) return setProblem("note");

    sending.current = true;
    setBusy(true);
    setProblem(null);
    const kind: ReportKind = mode === "help" ? "offer_help" : mode === "home" ? "offer_home" : (newStatus ?? "update");
    const { error } = await createClient()
      .from("reports")
      .insert({ pet_id: petId, author_id: userId, kind, help_type: mode === "help" ? helpType : null, note: text || null });
    sending.current = false;
    setBusy(false);
    if (error) return setProblem("send");
    setSent(true);
    router.refresh(); // the timeline and the status path come from the server, so ask for them again
  };

  const buttons: { mode: Mode; icon: typeof HandHelping; label: string; primary?: boolean }[] = [
    { mode: "help", icon: HandHelping, label: t("pet.help.help"), primary: true },
    { mode: "home", icon: House, label: t("pet.help.home") },
    { mode: "update", icon: MessageCircle, label: t("pet.help.update") },
  ];

  return (
    <section className="card relative flex flex-col gap-4 p-5" aria-labelledby="help-title">
      <div className="flex flex-col gap-1">
        <h2 id="help-title" className="text-xl">
          {t("pet.help.title")}
        </h2>
        <p className="text-sm text-muted">
          {offers + homes === 0
            ? t("pet.help.none")
            : [offers > 0 ? t("pet.help.offers", { n: offers }) : null, homes > 0 ? t("pet.help.homes", { n: homes }) : null].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* three ways to join in. Logged out, each one leads to the login door and brings the person back here. */}
      <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
        {buttons.map(({ mode: m, icon: Icon, label, primary }) => {
          const className = `btn ${primary ? "btn-primary min-[440px]:col-span-2" : "btn-ghost px-3"} ${mode === m ? "ring-2 ring-coral" : ""}`;
          return userId ? (
            <button key={m} type="button" onClick={() => open(m)} aria-expanded={mode === m} className={className}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </button>
          ) : (
            <Link key={m} href={loginHref} className={className}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
      {!userId && (
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <LogIn size={16} className="shrink-0" aria-hidden="true" />
          {t("pet.help.loginNote")}
        </p>
      )}

      {userId && mode && !sent && (
        <form onSubmit={submit} className="flex animate-[fade-up_0.3s_ease-out] flex-col gap-4 rounded-2xl bg-cream/60 p-4 dark:bg-foreground/6" noValidate>
          <h3 className="text-lg">{t(mode === "help" ? "pet.help.helpTitle" : mode === "home" ? "pet.help.homeTitle" : "pet.help.updateTitle")}</h3>
          {mode === "home" && <p className="-mt-2 text-sm text-muted">{t("pet.help.homeBody")}</p>}

          {mode === "help" && (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">{t("pet.help.helpTitle")}</legend>
              <div className="grid grid-cols-2 gap-2">
                {helpTypes.map((type) => (
                  <label key={type} className="relative">
                    <input type="radio" name="help-type" value={type} checked={helpType === type} onChange={() => setHelpType(type)} className="peer sr-only" />
                    <span className="flex min-h-12 items-center justify-center rounded-2xl border-[1.5px] border-line bg-surface px-3 py-2 text-center text-sm font-bold transition duration-200 peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-blue">
                      {t(`pet.help.type.${type}`)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {mode === "update" && canSetStatus && later.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-bold">{t("pet.help.statusLabel")}</legend>
              <div className="flex flex-wrap gap-2">
                {[null, ...later].map((step) => (
                  <label key={step ?? "keep"} className="relative">
                    <input type="radio" name="new-status" checked={newStatus === step} onChange={() => setNewStatus(step)} className="peer sr-only" />
                    <span
                      className="flex min-h-11 items-center rounded-full border-[1.5px] border-line bg-surface px-4 text-sm font-bold transition duration-200 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-blue"
                      style={step && newStatus === step ? { background: statusColor[step], borderColor: statusColor[step], color: step === "adopted" ? "#182033" : "#fff" } : newStatus === step ? { background: "#182033", borderColor: "#182033", color: "#fff" } : undefined}
                    >
                      {step ? t(`status.${step}`) : t("pet.help.statusKeep")}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">{t("pet.help.noteLabel")}</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t(mode === "help" ? "pet.help.placeholderHelp" : mode === "home" ? "pet.help.placeholderHome" : "pet.help.placeholderUpdate")}
              className={`${fieldClass} resize-none`}
            />
          </label>

          {problem && (
            <p role="alert" className="text-sm font-bold text-coral-ink dark:text-brownie">
              {t(problem === "pick" ? "pet.help.pickHelp" : problem === "note" ? "pet.help.needNote" : "pet.help.error")}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={close} className="btn btn-ghost px-4">
              {t("pet.help.cancel")}
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary flex-1">
              {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
              {busy ? t("pet.help.sending") : t("pet.help.send")}
            </button>
          </div>
        </form>
      )}

      {sent && (
        <div role="status" className="relative flex animate-[fade-up_0.3s_ease-out] flex-col items-center gap-2 rounded-2xl bg-green/10 p-5 text-center">
          <PawConfetti />
          <div className="w-24">
            <Brownie mood="happy" collar label="" />
          </div>
          <strong className="font-heading text-xl">{t("pet.help.thanksTitle")}</strong>
          <p className="text-sm text-muted">{t("pet.help.thanksBody")}</p>
          <button type="button" onClick={close} className="btn btn-ghost mt-1 px-6">
            {t("pet.help.done")}
          </button>
        </div>
      )}
    </section>
  );
}
