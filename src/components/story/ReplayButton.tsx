"use client";

import { useT } from "@/i18n/client";

export function ReplayButton({ className = "btn btn-ghost" }: { className?: string }) {
  const t = useT();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {t("home.replay")}
    </button>
  );
}
