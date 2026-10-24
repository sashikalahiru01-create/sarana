"use client";

import { AlertTriangle, ArrowUpRight, Cat, Dog, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/i18n/client";
import { agoParts, formatKm, statusColor, type Pet } from "@/lib/pets";
import { photoUrl } from "@/lib/reports";

type Props = {
  pet: Pet;
  /** Distance from the visitor in km, when they have shared their location. */
  km?: number;
  selected?: boolean;
  /** "map" is the small floating card on top of the map. */
  variant?: "list" | "map";
  onSelect?: () => void;
  onClose?: () => void;
};

/** One animal: photo that fades in over a shimmer, status in its colour, how far and how long ago. */
export function PetCard({ pet, km, selected = false, variant = "list", onSelect, onClose }: Props) {
  const t = useT();
  const [loaded, setLoaded] = useState(false);
  const Icon = pet.animal_type === "dog" ? Dog : Cat;
  const kind = t(`report.details.${pet.animal_type}`);
  const color = statusColor[pet.status];
  const photo = pet.photo_paths[0];
  const ago = agoParts(pet.created_at);
  const urgent = pet.is_urgent && pet.status !== "adopted";
  const compact = variant === "map";

  return (
    <article
      aria-current={selected ? "true" : undefined}
      className={`card relative flex gap-3 overflow-hidden p-3 transition duration-300 ease-spring ${
        selected ? "ring-2 ring-coral" : "hover:-translate-y-0.5 hover:shadow-pop"
      } ${compact ? "shadow-pop" : ""}`}
    >
      {/* the whole card is one big button for selecting; the link and close button sit above it */}
      {onSelect && !compact && (
        <button type="button" onClick={onSelect} aria-label={`${kind}, ${t(`status.${pet.status}`)}`} className="absolute inset-0 z-0 rounded-card" />
      )}

      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-line sm:size-28">
        {!loaded && photo && <div className="shimmer absolute inset-0" aria-hidden="true" />}
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote user photo, shown small
          <img
            src={photoUrl(photo)}
            alt={t("map.card.photoAlt", { type: kind })}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`size-full object-cover transition duration-500 ${loaded ? "scale-100 opacity-100 blur-0" : "scale-110 opacity-0 blur-md"}`}
          />
        ) : (
          <span className="grid size-full place-items-center text-muted">
            <Icon size={34} aria-hidden="true" />
            <span className="sr-only">{t("map.card.noPhoto")}</span>
          </span>
        )}
        {urgent && (
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-white shadow-coral">
            <AlertTriangle size={11} aria-hidden="true" />
            {t("status.urgent")}
          </span>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <Icon size={18} className="shrink-0 text-muted" aria-hidden="true" />
          <strong className="font-heading text-lg leading-tight">{kind}</strong>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("map.card.close")}
              className="pointer-events-auto ml-auto grid size-11 -translate-y-1.5 translate-x-1.5 place-items-center rounded-full text-muted hover:bg-foreground/8"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* a gold collar tag shaped status badge */}
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: color, color: pet.status === "adopted" ? "#182033" : "#fff" }}>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-80" />
          {t(`status.${pet.status}`)}
        </span>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-muted">
          {km !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <MapPin size={13} aria-hidden="true" />
              {t("map.away", { km: formatKm(km) })}
            </span>
          )}
          <span>{ago.unit === "now" ? t("map.ago.now") : t(`map.ago.${ago.unit}`, { n: ago.n })}</span>
        </p>

        {pet.location_label && !compact && <p className="line-clamp-1 text-[13px] text-muted">{pet.location_label}</p>}

        <Link href={`/pet/${pet.id}`} className="pointer-events-auto mt-auto inline-flex min-h-11 w-fit items-center gap-1 text-sm font-bold text-coral-ink hover:underline dark:text-brownie">
          {t("map.card.open")}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/** Placeholder with the same shape while the animals load. */
export function PetCardSkeleton() {
  return (
    <div className="card flex gap-3 p-3" aria-hidden="true">
      <div className="shimmer size-24 shrink-0 rounded-2xl sm:size-28" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="shimmer h-5 w-1/3 rounded" />
        <div className="shimmer h-5 w-1/2 rounded-full" />
        <div className="shimmer h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
