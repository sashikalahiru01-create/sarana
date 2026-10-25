"use client";

import { ExternalLink, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useT } from "@/i18n/client";
import type { PetStatus } from "@/lib/domain";
import { statusColor } from "@/lib/pets";

// Leaflet needs the browser, so the map loads on the client only, with a shimmer in its place.
const PetMiniMap = dynamic(() => import("./PetMiniMap"), {
  ssr: false,
  loading: () => <div className="shimmer size-full" aria-hidden="true" />,
});

type Props = { lat: number; lng: number; status: PetStatus; urgent: boolean; label: string | null };

/** Where the animal was seen: a small map, the place name and a link to open it in a full map. */
export function PetLocation({ lat, lng, status, urgent, label }: Props) {
  const t = useT();
  const openUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <section className="card flex flex-col gap-3 overflow-hidden p-5" aria-labelledby="where-title">
      <h2 id="where-title" className="text-xl">
        {t("pet.where.title")}
      </h2>
      <div className="relative h-56 overflow-hidden rounded-2xl bg-line sm:h-64">
        <PetMiniMap lat={lat} lng={lng} color={statusColor[status]} urgent={urgent && status !== "adopted"} label={t("pet.where.mapLabel")} />
      </div>
      <p className="flex items-start gap-2 text-[15px] font-semibold">
        <MapPin size={18} className="mt-0.5 shrink-0 text-coral" aria-hidden="true" />
        <span className="[overflow-wrap:anywhere]">{label ?? t("pet.where.pinned")}</span>
      </p>
      <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full sm:w-fit">
        <ExternalLink size={18} aria-hidden="true" />
        {t("pet.where.open")}
      </a>
    </section>
  );
}
