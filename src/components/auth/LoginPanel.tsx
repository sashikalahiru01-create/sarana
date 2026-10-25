"use client";

import { ArrowLeft, ArrowRight, Check, Circle, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import {
  checkEmail,
  checkPassword,
  CODE_LENGTH,
  isEmail,
  loadProviders,
  sendEmailCode,
  setPassword as savePasswordFor,
  signInWithPassword,
  signInWithProvider,
  verifyEmailCode,
  type AuthProblem,
  type LoggedIn,
  type Providers,
} from "@/lib/auth-client";
import { OtpInput } from "./OtpInput";
import { inputClass, PasswordField } from "./PasswordField";

export type PanelMood = "idle" | "watch" | "secret" | "wrong";

type Props = {
  /** Where Google should send the visitor after logging in. */
  next: string;
  /** `isNew`: they just created their account (chose a password after a code), so we can offer the volunteer details. */
  onDone: (user: LoggedIn, info: { isNew: boolean }) => void;
  /** Lets a mascot react to what the visitor is doing. */
  onMood?: (mood: PanelMood) => void;
  /** A problem to show on arrival, for example when Google sent them back without finishing. */
  initialProblem?: AuthProblem | null;
};

const RESEND_SECONDS = 30;
type Step = "method" | "email" | "password" | "code" | "newPassword";
/** "create": a new account or one without a password. "reset": someone who forgot theirs. */
type Purpose = "create" | "reset";
type Busy = null | "google" | "check" | "send" | "verify" | "signin" | "save";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.4 19.5v-6.1h2l.4-2.4h-2.4V9.5c0-.7.3-1.2 1.3-1.2h1.2V6.2c-.2 0-1-.1-1.8-.1-1.9 0-3.1 1.1-3.1 3.2V11H8.9v2.4H11v6.1h2.4z" />
    </svg>
  );
}

const methodButton =
  "flex min-h-14 w-full items-center justify-center gap-2.5 rounded-button border-[1.5px] border-line bg-surface px-4 text-[15px] font-bold whitespace-nowrap max-[359px]:whitespace-normal max-[359px]:px-3 max-[359px]:text-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

/**
 * Choose a way to join, and do it. Used on the /join page and again inside the report form, so a visitor who is
 * about to send a report can join without leaving it.
 *
 * Email first: we ask the database whether the email already has a password. If it does, the person types it.
 * If not (a new email, or an account that only ever used codes), we email a 6-digit code to prove the address and
 * then ask them to choose a password and confirm it. "Forgot your password?" uses the same code step.
 */
export function LoginPanel({ next, onDone, onMood, initialProblem = null }: Props) {
  const t = useT();
  const router = useRouter();
  const [step, setStep] = useState<Step>("method");
  const [providers, setProviders] = useState<Providers | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [purpose, setPurpose] = useState<Purpose>("create");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [passwordError, setPasswordError] = useState<null | "weak" | "mismatch">(null);
  const [verified, setVerified] = useState<LoggedIn | null>(null);
  const [problem, setProblem] = useState<AuthProblem | null>(initialProblem);
  const [emailError, setEmailError] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [codeState, setCodeState] = useState<"idle" | "wrong">("idle");
  const [sentAt, setSentAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let alive = true;
    loadProviders().then((p) => alive && setProviders(p));
    return () => {
      alive = false;
    };
  }, []);

  // Count down to "send a new code".
  useEffect(() => {
    if (!sentAt) return;
    const id = setInterval(() => setSecondsLeft(Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - sentAt) / 1000))), 500);
    return () => clearInterval(id);
  }, [sentAt]);

  // Move focus to the step heading so screen readers announce the new step.
  useEffect(() => {
    if (step !== "method") headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const problemText = (p: AuthProblem) => {
    switch (p) {
      case "rate":
        return t("login.errors.rate");
      case "network":
        return t("login.errors.network");
      case "wrong":
        return wrongTries >= 3 ? t("login.code.expired") : t("login.code.wrong");
      case "badPassword":
        return t("login.password.wrong");
      case "weak":
        return t("login.newPassword.weak");
      case "notReady":
        return t("login.methods.notReady");
      default:
        return t("login.errors.generic");
    }
  };

  const go = (to: Step, mood: PanelMood) => {
    setProblem(null);
    setStep(to);
    onMood?.(mood);
  };

  const google = async () => {
    setProblem(null);
    if (providers && !providers.google) return setProblem("notReady");
    setBusy("google");
    const result = await signInWithProvider("google", next);
    // on success the browser is already on its way to Google
    if (!result.ok) {
      setBusy(null);
      setProblem(result.problem);
    }
  };

  /** Emails the code and moves to the code step (also used by "send a new code" and "forgot your password"). */
  const sendCode = async (why: Purpose = purpose) => {
    setProblem(null);
    setBusy("send");
    const result = await sendEmailCode(email);
    setBusy(null);
    if (!result.ok) return setProblem(result.problem);
    setPurpose(why);
    setCode("");
    setCodeState("idle");
    setWrongTries(0);
    setSentAt(Date.now());
    setSecondsLeft(RESEND_SECONDS);
    go("code", "secret");
  };

  /** The email step: is this a new email, or does it already have a password? */
  const continueWithEmail = async () => {
    if (!isEmail(email)) return setEmailError(true);
    setEmailError(false);
    setProblem(null);
    setBusy("check");
    const result = await checkEmail(email);
    setBusy(null);
    if (!result.ok) return setProblem(result.problem);
    if (result.value === "password") {
      setPassword("");
      setShow(false);
      return go("password", "secret");
    }
    await sendCode("create");
  };

  const signIn = async () => {
    if (busy || !password) return;
    setProblem(null);
    setBusy("signin");
    const result = await signInWithPassword(email, password);
    setBusy(null);
    if (!result.ok) {
      setPassword("");
      onMood?.("wrong");
      setTimeout(() => onMood?.("secret"), 700);
      return setProblem(result.problem);
    }
    router.refresh(); // headers and other server parts now know who is logged in
    onDone(result.value, { isNew: false });
  };

  const savePassword = async () => {
    if (busy || !verified) return;
    const rules = checkPassword(password, confirm);
    if (!rules.strong) return setPasswordError("weak");
    if (!rules.match) return setPasswordError("mismatch");
    setPasswordError(null);
    setProblem(null);
    setBusy("save");
    const result = await savePasswordFor(password);
    setBusy(null);
    if (!result.ok) return setProblem(result.problem);
    router.refresh();
    onDone(verified, { isNew: purpose === "create" });
  };

  const verify = async (value: string) => {
    if (busy) return;
    setProblem(null);
    setBusy("verify");
    const result = await verifyEmailCode(email, value);
    setBusy(null);
    if (!result.ok) {
      if (result.problem === "wrong") {
        setWrongTries((n) => n + 1);
        setCodeState("wrong");
        onMood?.("wrong");
        setTimeout(() => {
          setCode("");
          setCodeState("idle");
          onMood?.("secret");
        }, 700);
      }
      return setProblem(result.problem);
    }
    // The email is proven and they are logged in. Now they choose a password (and confirm it).
    setVerified(result.value);
    setPassword("");
    setConfirm("");
    setShow(false);
    setPasswordError(null);
    go("newPassword", "secret");
  };

  const onCode = (value: string) => {
    setCode(value);
    setProblem(null);
    if (value.length === CODE_LENGTH) void verify(value);
  };

  const showProblem = problem && (
    <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
      {problemText(problem)}
    </p>
  );

  if (step === "email") {
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void continueWithEmail();
        }}
        noValidate
      >
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t("login.email.title")}
        </h2>
        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">{t("login.email.label")}</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            maxLength={200}
            placeholder={t("login.email.placeholder")}
            aria-invalid={emailError}
            onFocus={() => onMood?.("watch")}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
              setProblem(null);
            }}
            autoFocus
            className={`${inputClass} ${emailError ? "border-coral" : "border-line"}`}
          />
          {emailError && (
            <span role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
              {t("login.email.invalid")}
            </span>
          )}
        </label>
        <p className="text-sm text-muted">{t("login.email.hint")}</p>
        {showProblem}
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => go("method", "idle")} disabled={busy !== null}>
            <ArrowLeft size={18} aria-hidden="true" />
            {t("login.back")}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={busy !== null}>
            {busy === "check" || busy === "send" ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
            {busy === "check" || busy === "send" ? t("login.email.sending") : t("login.email.send")}
          </button>
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void signIn();
        }}
        noValidate
      >
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t("login.password.title")}
        </h2>
        <p className="text-muted [overflow-wrap:anywhere]">{t("login.password.subtitle", { email: email.trim() })}</p>
        <input type="email" value={email.trim()} autoComplete="username" readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />
        <PasswordField
          label={t("login.password.label")}
          value={password}
          onChange={(v) => {
            setPassword(v);
            setProblem(null);
          }}
          autoComplete="current-password"
          show={show}
          onToggle={() => {
            setShow((v) => !v);
            onMood?.(show ? "secret" : "watch");
          }}
          showLabel={t("login.password.show")}
          hideLabel={t("login.password.hide")}
          invalid={problem === "badPassword"}
          onFocus={() => onMood?.(show ? "watch" : "secret")}
          autoFocus
        />
        <div className="min-h-6" aria-live="polite">
          {showProblem}
        </div>
        <button type="submit" className="btn btn-primary !min-h-14" disabled={busy !== null || !password}>
          {busy === "signin" ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
          {busy === "signin" ? t("login.password.submitting") : t("login.password.submit")}
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="btn btn-ghost !min-h-11 !px-4 text-sm" onClick={() => go("email", "watch")} disabled={busy !== null}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t("login.password.other")}
          </button>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-button px-3 text-sm font-bold text-coral-ink transition duration-200 disabled:text-muted dark:text-brownie"
            onClick={() => void sendCode("reset")}
            disabled={busy !== null}
          >
            {busy === "send" && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {t("login.password.forgot")}
          </button>
        </div>
      </form>
    );
  }

  if (step === "newPassword") {
    const rules = checkPassword(password, confirm);
    const list: { ok: boolean; text: string }[] = [
      { ok: rules.length, text: t("login.newPassword.ruleLength") },
      { ok: rules.letter, text: t("login.newPassword.ruleLetter") },
      { ok: rules.number, text: t("login.newPassword.ruleNumber") },
      { ok: rules.match, text: t("login.newPassword.ruleMatch") },
    ];
    const toggle = () => {
      setShow((v) => !v);
      onMood?.(show ? "secret" : "watch");
    };
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void savePassword();
        }}
        noValidate
      >
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t(purpose === "reset" ? "login.newPassword.resetTitle" : "login.newPassword.createTitle")}
        </h2>
        <p className="text-muted">{t(purpose === "reset" ? "login.newPassword.resetBody" : "login.newPassword.createBody")}</p>
        <input type="email" value={email.trim()} autoComplete="username" readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />
        <PasswordField
          label={t("login.newPassword.label")}
          value={password}
          onChange={(v) => {
            setPassword(v);
            setPasswordError(null);
            setProblem(null);
          }}
          autoComplete="new-password"
          show={show}
          onToggle={toggle}
          showLabel={t("login.password.show")}
          hideLabel={t("login.password.hide")}
          invalid={passwordError === "weak"}
          onFocus={() => onMood?.(show ? "watch" : "secret")}
          autoFocus
        />
        <PasswordField
          label={t("login.newPassword.confirm")}
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setPasswordError(null);
          }}
          autoComplete="new-password"
          show={show}
          onToggle={toggle}
          showLabel={t("login.password.show")}
          hideLabel={t("login.password.hide")}
          invalid={passwordError === "mismatch"}
          onFocus={() => onMood?.(show ? "watch" : "secret")}
        />
        <ul className="grid grid-cols-1 gap-1.5 text-sm min-[420px]:grid-cols-2" aria-label={t("login.newPassword.label")}>
          {list.map(({ ok, text }) => (
            <li key={text} className={`flex items-center gap-2 font-semibold transition duration-200 ${ok ? "text-green dark:text-[#4fc3a5]" : "text-muted"}`}>
              {ok ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              {text}
            </li>
          ))}
        </ul>
        <div className="min-h-6" aria-live="polite">
          {passwordError ? (
            <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
              {t(passwordError === "weak" ? "login.newPassword.weak" : "login.newPassword.mismatch")}
            </p>
          ) : (
            showProblem
          )}
        </div>
        <button type="submit" className="btn btn-primary !min-h-14" disabled={busy !== null}>
          {busy === "save" ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
          {busy === "save" ? t("login.newPassword.saving") : t("login.newPassword.submit")}
        </button>
      </form>
    );
  }

  if (step === "code") {
    const circumference = 2 * Math.PI * 14;
    return (
      <div className="flex flex-col gap-4">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t("login.code.title")}
        </h2>
        <p className="text-muted [overflow-wrap:anywhere]">{t("login.code.sent", { email: email.trim() })}</p>

        <OtpInput value={code} onChange={onCode} label={t("login.code.label")} disabled={busy === "verify"} state={codeState} autoFocus />

        <div className="min-h-6" aria-live="polite">
          {busy === "verify" ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {t("login.code.verifying")}
            </p>
          ) : (
            showProblem
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="btn btn-ghost !min-h-11 !px-4 text-sm" onClick={() => go("email", "watch")} disabled={busy !== null}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t("login.code.change")}
          </button>

          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-button px-3 text-sm font-bold text-coral-ink transition duration-200 disabled:text-muted dark:text-brownie"
            disabled={secondsLeft > 0 || busy !== null}
            onClick={() => void sendCode(purpose)}
          >
            {secondsLeft > 0 && (
              <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true" className="-rotate-90">
                <circle cx="16" cy="16" r="14" fill="none" stroke="var(--line)" strokeWidth="3" />
                <circle
                  key={sentAt}
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="var(--color-coral)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  style={{ animation: `ring-count ${RESEND_SECONDS}s linear forwards`, ["--ring" as string]: String(circumference) }}
                />
              </svg>
            )}
            {secondsLeft > 0 ? t("login.code.resendIn", { s: secondsLeft }) : t("login.code.resend")}
          </button>
        </div>
      </div>
    );
  }

  const googleOff = providers !== null && !providers.google;
  const facebookOff = providers === null || !providers.facebook;

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={t("login.methods.label")}>
      <button type="button" className={methodButton} onClick={() => void google()} disabled={busy !== null} aria-disabled={googleOff}>
        {busy === "google" ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <GoogleMark />}
        {busy === "google" ? t("login.methods.redirecting") : t("login.methods.google")}
        {googleOff && <span className="rounded-full bg-gold/30 px-2 py-0.5 text-xs font-bold text-[#8a5b00] dark:text-gold">{t("login.methods.soon")}</span>}
      </button>

      <button type="button" className={methodButton} disabled aria-disabled="true">
        <FacebookMark />
        {t("login.methods.facebook")}
        {facebookOff && <span className="rounded-full bg-gold/30 px-2 py-0.5 text-xs font-bold text-[#8a5b00] dark:text-gold">{t("login.methods.soon")}</span>}
      </button>

      <div className="my-1 flex items-center gap-3 text-sm font-semibold text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        {t("login.methods.or")}
        <span className="h-px flex-1 bg-line" />
      </div>

      <button type="button" className="btn btn-primary !min-h-14" onClick={() => go("email", "watch")} disabled={busy !== null}>
        <Mail size={20} aria-hidden="true" />
        {t("login.methods.email")}
      </button>

      {problem && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {problemText(problem)}
        </p>
      )}
    </div>
  );
}
