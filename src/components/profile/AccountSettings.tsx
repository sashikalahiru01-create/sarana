"use client";

import { Check, KeyRound, Loader2, LogOut, Save } from "lucide-react";
import { useState } from "react";
import { PasswordField } from "@/components/auth/PasswordField";
import { useT } from "@/i18n/client";
import { signOut } from "@/lib/auth-actions";
import { checkPassword, setPassword } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase/client";

type Props = { userId: string; email: string | null; displayName: string | null };

const field = "min-h-12 w-full rounded-button border-[1.5px] border-line bg-surface px-4 text-[16px]";

/** The person's name, their password, and log out. */
export function AccountSettings({ userId, email, displayName }: Props) {
  const t = useT();

  // name
  const [name, setName] = useState(displayName ?? "");
  const [nameState, setNameState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (nameState === "saving") return;
    setNameState("saving");
    const { error } = await createClient().from("profiles").update({ display_name: name.trim() || null }).eq("id", userId);
    setNameState(error ? "error" : "saved");
  };

  // password
  const [password, setPasswordText] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [passwordState, setPasswordState] = useState<"idle" | "saving" | "saved" | "weak" | "mismatch" | "error">("idle");
  const rules = checkPassword(password, confirm);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordState === "saving") return;
    if (!rules.strong) return setPasswordState("weak");
    if (!rules.match) return setPasswordState("mismatch");
    setPasswordState("saving");
    const result = await setPassword(password);
    if (!result.ok) return setPasswordState(result.problem === "weak" ? "weak" : "error");
    setPasswordText("");
    setConfirm("");
    setPasswordState("saved");
  };

  const status = (text: string, ok: boolean) => (
    <p role={ok ? "status" : "alert"} className={`flex items-center gap-1.5 text-sm font-semibold ${ok ? "text-green dark:text-[#4fc3a5]" : "text-coral-ink dark:text-brownie"}`}>
      {ok && <Check size={16} strokeWidth={3} aria-hidden="true" />}
      {text}
    </p>
  );

  return (
    <>
      <section className="card flex flex-col gap-4 p-5" aria-labelledby="account-title">
        <h2 id="account-title" className="text-xl">
          {t("profile.account.title")}
        </h2>
        <form onSubmit={saveName} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">{t("profile.account.name")}</span>
            <input
              type="text"
              value={name}
              maxLength={80}
              autoComplete="name"
              placeholder={t("profile.account.namePlaceholder")}
              onChange={(e) => {
                setName(e.target.value);
                setNameState("idle");
              }}
              className={field}
            />
            <span className="text-sm text-muted">{t("profile.account.nameHint")}</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold">{t("profile.account.email")}</span>
            <p className="min-h-12 rounded-button bg-foreground/5 px-4 py-3 text-muted [overflow-wrap:anywhere]">{email ?? "—"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={nameState === "saving"}>
              {nameState === "saving" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
              {nameState === "saving" ? t("profile.account.saving") : t("profile.account.save")}
            </button>
            {nameState === "saved" && status(t("profile.account.saved"), true)}
            {nameState === "error" && status(t("profile.account.error"), false)}
          </div>
        </form>
      </section>

      <section className="card flex flex-col gap-4 p-5" aria-labelledby="password-title">
        <h2 id="password-title" className="text-xl">
          {t("profile.password.title")}
        </h2>
        <p className="-mt-2 text-sm text-muted">{t("profile.password.intro")}</p>
        <form onSubmit={changePassword} className="flex flex-col gap-4" noValidate>
          <input type="email" value={email ?? ""} autoComplete="username" readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />
          <PasswordField
            label={t("profile.password.new")}
            value={password}
            onChange={(v) => {
              setPasswordText(v);
              setPasswordState("idle");
            }}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((v) => !v)}
            showLabel={t("login.password.show")}
            hideLabel={t("login.password.hide")}
            invalid={passwordState === "weak"}
          />
          <PasswordField
            label={t("profile.password.confirm")}
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              setPasswordState("idle");
            }}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((v) => !v)}
            showLabel={t("login.password.show")}
            hideLabel={t("login.password.hide")}
            invalid={passwordState === "mismatch"}
          />
          <ul className="grid grid-cols-1 gap-1.5 text-sm min-[420px]:grid-cols-2">
            {[
              [rules.length, t("login.newPassword.ruleLength")],
              [rules.letter, t("login.newPassword.ruleLetter")],
              [rules.number, t("login.newPassword.ruleNumber")],
              [rules.match, t("login.newPassword.ruleMatch")],
            ].map(([ok, text]) => (
              <li key={String(text)} className={`flex items-center gap-2 font-semibold ${ok ? "text-green dark:text-[#4fc3a5]" : "text-muted"}`}>
                <Check size={16} strokeWidth={3} className={ok ? "" : "opacity-30"} aria-hidden="true" />
                {String(text)}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={passwordState === "saving"}>
              {passwordState === "saving" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
              {passwordState === "saving" ? t("profile.password.changing") : t("profile.password.change")}
            </button>
            {passwordState === "saved" && status(t("profile.password.changed"), true)}
            {passwordState === "weak" && status(t("login.newPassword.weak"), false)}
            {passwordState === "mismatch" && status(t("login.newPassword.mismatch"), false)}
            {passwordState === "error" && status(t("profile.account.error"), false)}
          </div>
        </form>
      </section>

      <form action={signOut}>
        <button type="submit" className="btn btn-ghost w-full">
          <LogOut size={18} aria-hidden="true" />
          {t("nav.logout")}
        </button>
      </form>
    </>
  );
}
