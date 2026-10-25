"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { createPetIcon, OSM_ATTRIBUTION, OSM_TILES } from "@/components/map/pin";

type Props = { lat: number; lng: number; color: string; urgent: boolean; label: string };

/** A small map with this animal's pin. On a phone one finger scrolls the page, so the map only moves with two. */
export default function PetMiniMap({ lat, lng, color, urgent, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = L.map(el, { center: [lat, lng], zoom: 16, scrollWheelZoom: false, dragging: !L.Browser.mobile });
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
    L.marker([lat, lng], { icon: createPetIcon(color, urgent, true), title: label, alt: label, keyboard: false }).addTo(map);
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(el);
    return () => {
      resize.disconnect();
      map.remove();
    };
  }, [lat, lng, color, urgent, label]);

  return <div ref={containerRef} role="img" aria-label={label} className="size-full" />;
}
