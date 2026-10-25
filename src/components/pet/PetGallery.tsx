"use client";

import { AlertTriangle, Cat, Dog } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/client";
import type { AnimalType, PetStatus } from "@/lib/domain";
import { statusColor } from "@/lib/pets";
import { photoUrl } from "@/lib/reports";

type Props = { photos: string[]; animal: AnimalType; status: PetStatus; urgent: boolean };

/** The big photo (blurred at first, then fading in), with small thumbnails to switch when there are several. */
export function PetGallery({ photos, animal, status, urgent }: Props) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, true>>({});
  const kind = t(`report.details.${animal}`);
  const Icon = animal === "dog" ? Dog : Cat;
  const markLoaded = (i: number) => setLoaded((prev) => (prev[i] ? prev : { ...prev, [i]: true }));

  return (
    <div className="flex flex-col gap-3">
      <div className="card relative aspect-[4/3] overflow-hidden bg-line shadow-pop sm:aspect-[16/10] lg:aspect-[4/3]">
        {photos.length === 0 ? (
          <div className="grid size-full place-items-center bg-linear-to-br from-cream to-brownie/30 text-muted dark:from-night dark:to-surface">
            <div className="flex flex-col items-center gap-2">
              <Icon size={64} aria-hidden="true" />
              <p className="font-semibold">{t("pet.noPhoto")}</p>
            </div>
          </div>
        ) : (
          <>
            {!loaded[index] && <div className="shimmer absolute inset-0" aria-hidden="true" />}
            {/* eslint-disable-next-line @next/next/no-img-element -- remote user photo */}
            <img
              key={photos[index]}
              ref={(el) => {
                // a photo that was already cached finishes before React attaches onLoad
                if (el?.complete && el.naturalWidth > 0) markLoaded(index);
              }}
              src={photoUrl(photos[index])}
              alt={t("map.card.photoAlt", { type: kind })}
              fetchPriority={index === 0 ? "high" : undefined}
              onLoad={() => markLoaded(index)}
              className={`size-full object-cover transition duration-500 ${loaded[index] ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-lg"}`}
            />
          </>
        )}

        {/* a coloured edge in the status colour, like the pin on the map */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: statusColor[status] }} />
        {urgent && status !== "adopted" && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-coral px-3 py-1 text-sm font-bold text-white shadow-coral">
            <AlertTriangle size={14} aria-hidden="true" />
            {t("status.urgent")}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="flex gap-2" aria-label={t("pet.photosLabel")}>
          {photos.map((path, i) => (
            <li key={path}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("pet.photoOpen", { n: i + 1, total: photos.length })}
                aria-current={i === index ? "true" : undefined}
                className={`relative block size-16 overflow-hidden rounded-2xl ring-2 transition duration-200 sm:size-20 ${
                  i === index ? "ring-coral" : "opacity-70 ring-transparent hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote user photo, shown small */}
                <img src={photoUrl(path)} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
