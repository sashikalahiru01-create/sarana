"use client";

import { PawPrint } from "lucide-react";
import { useState } from "react";
import { CODE_LENGTH } from "@/lib/auth-client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  /** "wrong" shakes the boxes and turns them coral. */
  state?: "idle" | "wrong";
  autoFocus?: boolean;
};

/**
 * Six paw boxes for the emailed code. Behind them sits ONE real input that catches typing, pasting and the phone's
 * "fill from SMS/email" suggestion, so all of that works as it does in any normal field. Each digit lights a box gold.
 */
export function OtpInput({ value, onChange, label, disabled, state = "idle", autoFocus }: Props) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <div className={`relative ${state === "wrong" ? "animate-[otp-shake_0.45s_ease-in-out]" : ""}`}>
      <div aria-hidden="true" className="grid grid-cols-6 gap-2 sm:gap-2.5">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const digit = value[i];
          const isActive = focused && !disabled && i === active && value.length < CODE_LENGTH;
          return (
            <div
              key={i}
              className={`relative grid aspect-[4/5] place-items-center rounded-2xl border-2 font-heading text-2xl font-extrabold transition duration-200 ease-spring sm:text-3xl ${
                state === "wrong"
                  ? "border-coral bg-coral/10 text-coral-ink"
                  : digit
                    ? "scale-105 border-[#d9961a] bg-linear-to-b from-[#ffe08a] to-[#f2b544] text-midnight shadow-[0_8px_14px_-8px_rgb(180_110_10/0.8)]"
                    : isActive
                      ? "border-coral bg-surface shadow-[0_0_0_4px_rgb(228_87_46/0.15)]"
                      : "border-line bg-surface/70"
              }`}
            >
              {digit ? (
                <span className="animate-[pop-in_0.25s_cubic-bezier(0.34,1.4,0.64,1)]">{digit}</span>
              ) : (
                <PawPrint size={20} className={`transition duration-200 ${isActive ? "text-coral/60" : "text-line"}`} />
              )}
            </div>
          );
        })}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        disabled={disabled}
        autoFocus={autoFocus}
        // 16px text keeps iPhones from zooming in; the input itself is invisible but fills the whole row, so a tap anywhere focuses it
        className="absolute inset-0 size-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
      />
    </div>
  );
}
