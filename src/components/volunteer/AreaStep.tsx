"use client";

import { Check, Loader2, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { LatLng } from "@/components/report/LocationMap";
import { useT } from "@/i18n/client";
import { RADIUS_MAX, RADIUS_MIN } from "@/lib/volunteers";

// Leaflet needs the browser, so the map loads on the client only, with a shimmer in its place.
const LocationMap = dynamic(() => import("@/components/report/LocationMap"), {
  ssr: false,
  loading: () => <div className="shimmer h-64 w-full rounded-card" aria-hidden="true" />,
});

type Props = {
  area: string;
  position: LatLng | null;
  radiusKm: number;
  error: string | null;
  onArea: (area: string) => void;
  onPosition: (position: LatLng) => void;
  onRadius: (km: number) => void;
};

export function AreaStep({ area, position, radiusKm, error, onArea, onPosition, onRadius }: Props) {
  const t = useT();
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);

  const locate = () => {
    setFailed(false);
    if (!("geolocation" in navigator)) return setFailed(true);
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
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const fill = ((radiusKm - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN)) * 100;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted">{t("volunteer.area.hint")}</p>

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">{t("volunteer.area.label")}</span>
        <input
          type="text"
          value={area}
          maxLength={120}
          onChange={(e) => onArea(e.target.value)}
          placeholder={t("volunteer.area.placeholder")}
          autoComplete="address-level2"
          className="min-h-12 rounded-button border-[1.5px] border-line bg-surface px-4"
        />
      </label>

      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold">{t("volunteer.area.pin")}</p>
          <p className="text-sm text-muted">{t("volunteer.area.pinHint")}</p>
        </div>
        <button type="button" className="btn btn-ghost self-start" disabled={locating} onClick={locate}>
          {locating ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
          {locating ? t("volunteer.area.locating") : t("volunteer.area.useMine")}
        </button>
        {failed && (
          <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
            {t("volunteer.area.failed")}
          </p>
        )}
        <div className="h-64 overflow-hidden rounded-card">
          <LocationMap position={position} onChange={onPosition} label={t("volunteer.area.mapLabel")} />
        </div>
        {position && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-semibold text-green">
            <Check size={16} aria-hidden="true" />
            {t("volunteer.area.placed")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="radius" className="font-semibold">
            {t("volunteer.area.radius")}
          </label>
          <output htmlFor="radius" className="rounded-full bg-coral/12 px-3 py-1 font-heading text-sm font-extrabold tabular-nums text-coral-ink dark:text-brownie">
            {t("volunteer.area.radiusValue", { km: radiusKm })}
          </output>
        </div>
        <input
          id="radius"
          type="range"
          min={RADIUS_MIN}
          max={RADIUS_MAX}
          value={radiusKm}
          onChange={(e) => onRadius(Number(e.target.value))}
          className="radius-slider h-11 w-full cursor-pointer"
          style={{ ["--fill" as string]: `${fill}%` }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {error}
        </p>
      )}
    </div>
  );
}
