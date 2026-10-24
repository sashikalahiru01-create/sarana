"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { statusColor, type Pet } from "@/lib/pets";
import { createPetIcon, createYouIcon, OSM_ATTRIBUTION, OSM_TILES, SRI_LANKA_CENTER, SRI_LANKA_ZOOM } from "./pin";

type Props = {
  pets: Pet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Where the visitor is, once they have shared it. */
  you: { lat: number; lng: number } | null;
  /** Changes whenever the map should re-frame the visible animals (new data or a new filter). */
  fitKey: string;
  /** Changes when the visitor asks to be shown (their own location, or a chosen animal). */
  focus: { n: number; lat: number; lng: number; zoom: number } | null;
  label: string;
  youLabel: string;
};

/** Leaflet map with one pin per animal. Pins are added, removed and restyled in place, never rebuilt all at once. */
export default function PetsMap({ pets, selectedId, onSelect, you, fitKey, focus, label, youLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; key: string }>());
  const youRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const petsRef = useRef(pets);

  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedRef.current = selectedId;
    petsRef.current = pets;
  });

  // Create the map once, and keep its size right when the container changes (view switch, rotation).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = L.map(el, { center: SRI_LANKA_CENTER, zoom: SRI_LANKA_ZOOM, zoomControl: false, scrollWheelZoom: true });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
    mapRef.current = map;
    const markers = markersRef.current;
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(el);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      markers.clear();
      youRef.current = null;
    };
  }, []);

  // Keep the pins in step with the animals: add new ones, drop removed ones, restyle changed ones.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const wanted = new Set(pets.map((p) => p.id));

    for (const [id, entry] of markers) {
      if (!wanted.has(id)) {
        entry.marker.remove();
        markers.delete(id);
      }
    }
    pets.forEach((pet, i) => {
      const color = statusColor[pet.status];
      const key = `${color}|${pet.is_urgent && pet.status !== "adopted"}`;
      const existing = markers.get(pet.id);
      const selected = pet.id === selectedRef.current;
      if (existing && existing.key === key) return;
      if (existing) {
        existing.key = key;
        existing.marker.setIcon(createPetIcon(color, pet.is_urgent && pet.status !== "adopted", selected));
        return;
      }
      const marker = L.marker([pet.lat, pet.lng], {
        icon: createPetIcon(color, pet.is_urgent && pet.status !== "adopted", selected),
        keyboard: true,
        title: pet.location_label ?? "",
        riseOnHover: true,
      }).addTo(map);
      marker.on("click", () => onSelectRef.current(pet.id));
      // pins drop in one after another
      const icon = marker.getElement();
      if (icon) icon.style.animationDelay = `${Math.min(i, 20) * 0.04}s`;
      markers.set(pet.id, { marker, key });
    });
  }, [pets]);

  // The selected pin grows and rises above its neighbours.
  const lastSelected = useRef<string | null>(null);
  useEffect(() => {
    const markers = markersRef.current;
    const paint = (id: string | null, selected: boolean) => {
      if (!id) return;
      const entry = markers.get(id);
      const pet = petsRef.current.find((p) => p.id === id);
      if (!entry || !pet) return;
      entry.marker.setIcon(createPetIcon(statusColor[pet.status], pet.is_urgent && pet.status !== "adopted", selected));
      entry.marker.setZIndexOffset(selected ? 1000 : 0);
    };
    if (lastSelected.current !== selectedId) paint(lastSelected.current, false);
    paint(selectedId, true);
    lastSelected.current = selectedId;
  }, [selectedId, pets]);

  // Frame the visible animals (and the visitor, if known) when the data or the filter changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !petsRef.current.length) return;
    const points = petsRef.current.map((p) => L.latLng(p.lat, p.lng));
    if (points.length === 1) map.flyTo(points[0], 15, { duration: 0.8 });
    else map.flyToBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 16, duration: 0.8 });
  }, [fitKey]);

  // "Find animals near me" and "show this animal on the map".
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo([focus.lat, focus.lng], focus.zoom, { duration: 1.1 });
  }, [focus]);

  // The visitor's own dot.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!you) {
      youRef.current?.remove();
      youRef.current = null;
      return;
    }
    if (youRef.current) youRef.current.setLatLng([you.lat, you.lng]);
    else youRef.current = L.marker([you.lat, you.lng], { icon: createYouIcon(), title: youLabel, interactive: false, keyboard: false, zIndexOffset: -500 }).addTo(map);
  }, [you, youLabel]);

  return <div ref={containerRef} role="application" aria-label={label} className="size-full" />;
}
