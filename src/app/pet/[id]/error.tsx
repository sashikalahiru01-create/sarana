"use client";

import { RotateCw } from "lucide-react";
import { Brownie } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";

/** The animal could not be loaded (usually no internet): Brownie with a drooped ear and a friendly retry. */
export default function PetError({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <div role="alert" className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="w-44">
        <Brownie mood="worried" label="" />
      </div>
      <h1 className="text-2xl leading-tight">{t("map.error.title")}</h1>
      <p className="text-muted">{t("map.error.body")}</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        <RotateCw size={18} aria-hidden="true" />
        {t("map.error.retry")}
      </button>
    </div>
  );
}
