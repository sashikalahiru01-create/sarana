"use client";

import { Eye, EyeOff } from "lucide-react";
import { PASSWORD_MAX } from "@/lib/auth-client";

/** The look shared by the email and password boxes. */
export const inputClass = "min-h-14 w-full rounded-button border-[1.5px] bg-surface px-4 text-[16px]";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  show: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
  invalid?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
};

/** A password box with a show/hide eye. Used on the Join page and in the profile, so every password field matches. */
export function PasswordField({ label, value, onChange, autoComplete, show, onToggle, showLabel, hideLabel, invalid = false, autoFocus = false, onFocus }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-semibold">{label}</span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          maxLength={PASSWORD_MAX}
          aria-invalid={invalid}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-14 ${invalid ? "border-coral" : "border-line"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? hideLabel : showLabel}
          aria-pressed={show}
          className="absolute right-1 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-button text-muted transition duration-200 hover:text-foreground"
        >
          {show ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
