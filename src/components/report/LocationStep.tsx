"use client";

import { Check, Loader2, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useT } from "@/i18n/client";
import type { LatLng } from "./LocationMap";

// Leaflet needs the browser, so the map loads on the client only, with a skeleton while it loads.
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => <div className="shimmer h-80 w-full rounded-card" aria-hidden="true" />,
});

type Props = {
  position: LatLng | null;
  label: string;
  onPosition: (position: LatLng) => void;
  onLabel: (label: string) => void;
};

export function LocationStep({ position, label, onPosition, onLabel }: Props) {
  const t = useT();
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);

  const locate = () => {
    setFailed(false);
    if (!("geolocation" in navigator)) {
      setFailed(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setFailed(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">{t("report.location.hint")}</p>

      <button type="button" className="btn btn-primary self-start" disabled={locating} onClick={locate}>
        {locating ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <LocateFixed size={20} aria-hidden="true" />}
        {locating ? t("report.location.locating") : t("report.location.useMine")}
      </button>

      {failed && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {t("report.location.failed")}
        </p>
      )}

      <LocationMap position={position} onChange={onPosition} label={t("report.location.mapLabel")} />

      {position && (
        <p role="status" className="flex items-center gap-1.5 text-sm font-semibold text-green">
          <Check size={16} aria-hidden="true" />
          {t("report.location.placed")}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t("report.location.label")}</span>
        <input
          type="text"
          value={label}
          maxLength={200}
          onChange={(e) => onLabel(e.target.value)}
          placeholder={t("report.location.labelPlaceholder")}
          className="min-h-12 rounded-button border-[1.5px] border-line bg-surface px-4"
        />
      </label>
    </div>
  );
}
