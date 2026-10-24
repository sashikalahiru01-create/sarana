"use client";

import { useT } from "@/i18n/client";

export function ReplayButton() {
  const t = useT();

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      {t("home.replay")}
    </button>
  );
}
