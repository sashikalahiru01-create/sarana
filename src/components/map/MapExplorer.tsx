"use client";

import { List, Loader2, Map as MapIcon, RefreshCw, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brownie } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";
import { distanceKm, fetchPets, matchesFilter, petFilters, statusColor, type Pet, type PetFilter } from "@/lib/pets";
import { PetCard, PetCardSkeleton } from "./PetCard";

// Leaflet needs the browser, so the map loads on the client only, with a shimmer in its place.
const PetsMap = dynamic(() => import("./PetsMap"), {
  ssr: false,
  loading: () => <div className="shimmer size-full" aria-hidden="true" />,
});

type Load = { state: "loading" } | { state: "error" } | { state: "ready"; pets: Pet[] };

const filterKey: Record<PetFilter, "all" | "dogs" | "cats" | "urgent" | "needsHome"> = {
  all: "all",
  dogs: "dogs",
  cats: "cats",
  urgent: "urgent",
  needsHome: "needsHome",
};

/** The whole /map page: filters, the map, and the list. On a phone you switch between map and list; on a laptop both show. */
export function MapExplorer() {
  const t = useT();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<PetFilter>("all");
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [you, setYou] = useState<{ lat: number; lng: number } | null>(null);
  const [sniffing, setSniffing] = useState(false);
  const [sniffFailed, setSniffFailed] = useState(false);
  const [focus, setFocus] = useState<{ n: number; lat: number; lng: number; zoom: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPets().then(
      (pets) => !cancelled && setLoad({ state: "ready", pets }),
      () => !cancelled && setLoad({ state: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoad({ state: "loading" });
    setAttempt((n) => n + 1);
  };

  const allPets = useMemo(() => (load.state === "ready" ? load.pets : []), [load]);

  // Visible animals: filtered, then ordered by distance when the visitor shared their location, otherwise urgent first, then newest.
  const visible = useMemo(() => {
    const rows = allPets
      .filter((p) => matchesFilter(p, filter))
      .map((pet) => ({ pet, km: you ? distanceKm(you, pet) : undefined }));
    rows.sort((a, b) => {
      if (a.km !== undefined && b.km !== undefined) return a.km - b.km;
      const urgent = Number(b.pet.is_urgent) - Number(a.pet.is_urgent);
      return urgent || b.pet.created_at.localeCompare(a.pet.created_at);
    });
    return rows;
  }, [allPets, filter, you]);

  const visiblePets = useMemo(() => visible.map((r) => r.pet), [visible]);
  const selected = visible.find((r) => r.pet.id === selectedId) ?? null;

  // A selection that the filter hides simply has no match in `visible`, so nothing is shown as selected.
  const activeId = selected?.pet.id ?? null;

  const fitKey = `${load.state}|${filter}|${visiblePets.length}`;

  const select = useCallback(
    (id: string, from: "map" | "list") => {
      setSelectedId(id);
      const pet = allPets.find((p) => p.id === id);
      if (from === "list") {
        if (pet) setFocus((f) => ({ n: (f?.n ?? 0) + 1, lat: pet.lat, lng: pet.lng, zoom: 16 }));
        setView("map"); // on a phone the list sits behind the map; show it
      } else {
        // from the map: bring the card into view in the list (laptop)
        requestAnimationFrame(() => listRef.current?.querySelector(`[data-pet="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
      }
    },
    [allPets],
  );

  const sniff = () => {
    setSniffFailed(false);
    if (!("geolocation" in navigator)) return setSniffFailed(true);
    setSniffing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSniffing(false);
        setYou(here);
        setFocus((f) => ({ n: (f?.n ?? 0) + 1, ...here, zoom: 14 }));
      },
      () => {
        setSniffing(false);
        setSniffFailed(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const counts = useMemo(() => {
    const c = {} as Record<PetFilter, number>;
    for (const f of petFilters) c[f] = allPets.filter((p) => matchesFilter(p, f)).length;
    return c;
  }, [allPets]);

  const loading = load.state === "loading";
  const empty = load.state === "ready" && visible.length === 0;

  return (
    <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-3 pb-4 pt-4 sm:px-4 lg:h-[calc(100svh-4rem)] lg:pb-4">
      {/* title row + actions */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(26px,3.4vw,38px)]">{t("map.title")}</h1>
          <p className="text-sm text-muted">{t("map.subtitle")}</p>
        </div>
        <button type="button" onClick={sniff} disabled={sniffing} className="btn btn-primary !min-h-12 !px-5">
          {sniffing ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          {sniffing ? t("map.sniffing") : t("map.sniff")}
        </button>
      </div>

      {sniffFailed && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {t("map.sniffFailed")}
        </p>
      )}

      {/* filter chips + (phone) map/list switch */}
      <div className="flex items-center gap-2">
        <div role="group" aria-label={t("map.filters.label")} className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {petFilters.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition duration-200 active:scale-95 ${
                  on ? "border-midnight bg-midnight text-white dark:border-cream dark:bg-cream dark:text-midnight" : "border-line bg-surface hover:border-coral/60"
                }`}
              >
                {t(`map.filters.${filterKey[f]}`)}
                {!loading && <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-white/20 dark:bg-midnight/15" : "bg-foreground/8 text-muted"}`}>{counts[f]}</span>}
              </button>
            );
          })}
        </div>

        <div role="group" aria-label={t("map.view.label")} className="glass flex shrink-0 rounded-full p-0.5 lg:hidden">
          {(["map", "list"] as const).map((v) => {
            const Icon = v === "map" ? MapIcon : List;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={t(`map.view.${v}`)}
                onClick={() => setView(v)}
                className={`grid size-11 place-items-center rounded-full transition duration-200 ${view === v ? "bg-coral text-white shadow-coral" : "text-muted"}`}
              >
                <Icon size={19} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* colour key */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
        {(["reported", "help_on_the_way", "safe", "adopted"] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: statusColor[s] }} />
            {t(`status.${s}`)}
          </li>
        ))}
        {!loading && load.state === "ready" && <li className="ml-auto tabular-nums">{t("map.count", { n: visible.length })}</li>}
      </ul>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
        {/* the list */}
        <div className={`-m-2 min-h-0 overflow-y-auto p-2 lg:block ${view === "list" ? "block" : "hidden"} max-lg:max-h-[calc(100svh-23rem)] max-lg:min-h-[22rem]`}>
          {loading && (
            <ul className="flex flex-col gap-3" aria-label={t("common.loading")}>
              {[0, 1, 2, 3].map((i) => (
                <li key={i}>
                  <PetCardSkeleton />
                </li>
              ))}
            </ul>
          )}

          {load.state === "error" && (
            <div className="card flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-32">
                <Brownie mood="worried" label="" />
              </div>
              <h2 className="text-xl">{t("map.error.title")}</h2>
              <p className="text-muted">{t("map.error.body")}</p>
              <button type="button" onClick={retry} className="btn btn-primary">
                <RefreshCw size={18} aria-hidden="true" />
                {t("map.error.retry")}
              </button>
            </div>
          )}

          {empty && (
            <div className="card flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-36">
                <Brownie mood="sleeping" label="" />
              </div>
              <h2 className="text-xl">{t("map.empty.title")}</h2>
              <p className="text-muted">{t("map.empty.body")}</p>
              {filter !== "all" && (
                <button type="button" onClick={() => setFilter("all")} className="btn btn-ghost">
                  {t("map.empty.reset")}
                </button>
              )}
            </div>
          )}

          {load.state === "ready" && visible.length > 0 && (
            <ul ref={listRef} className="flex flex-col gap-3 pb-2">
              {visible.map(({ pet, km }) => (
                <li key={pet.id} data-pet={pet.id}>
                  <PetCard pet={pet} km={km} selected={pet.id === activeId} onSelect={() => select(pet.id, "list")} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* the map */}
        <div className={`relative min-h-[22rem] overflow-hidden rounded-[28px] border border-line shadow-soft lg:block lg:min-h-0 ${view === "map" ? "block" : "hidden"} max-lg:h-[calc(100svh-23rem)]`}>
          <PetsMap
            pets={visiblePets}
            selectedId={activeId}
            onSelect={(id) => select(id, "map")}
            you={you}
            fitKey={fitKey}
            focus={focus}
            label={t("map.mapLabel")}
            youLabel={t("map.here")}
          />
          {loading && <div className="shimmer pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />}

          {/* phone: the chosen animal as a floating card over the map */}
          {selected && (
            <div className="absolute inset-x-3 bottom-3 z-[500] animate-[pop-in_0.4s_cubic-bezier(0.34,1.4,0.64,1)] lg:hidden">
              <PetCard pet={selected.pet} km={selected.km} variant="map" selected onClose={() => setSelectedId(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
