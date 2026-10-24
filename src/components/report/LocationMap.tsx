"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { createPinIcon, OSM_ATTRIBUTION, OSM_TILES, SRI_LANKA_CENTER, SRI_LANKA_ZOOM } from "@/components/map/pin";

export type LatLng = { lat: number; lng: number };

type Props = {
  position: LatLng | null;
  onChange: (position: LatLng) => void;
  label: string;
};

/** Leaflet map with one draggable pin. Tap the map or drag the pin to set the location. */
export default function LocationMap({ position, onChange, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, { center: SRI_LANKA_CENTER, zoom: SRI_LANKA_ZOOM, scrollWheelZoom: false });
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Keep the pin in sync with the position chosen by tapping, dragging or GPS.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    const latlng = L.latLng(position.lat, position.lng);

    if (!markerRef.current) {
      const marker = L.marker(latlng, { draggable: true, icon: createPinIcon(), title: label, alt: label }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      markerRef.current = marker;
      map.setView(latlng, Math.max(map.getZoom(), 16));
    } else {
      markerRef.current.setLatLng(latlng);
      if (!map.getBounds().contains(latlng)) map.panTo(latlng);
    }
  }, [position, label]);

  return <div ref={containerRef} role="application" aria-label={label} className="h-80 w-full rounded-card" />;
}
