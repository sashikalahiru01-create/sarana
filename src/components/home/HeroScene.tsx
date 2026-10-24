"use client";

import { PawPrint } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Brownie, type BrownieMood } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";
import type { DayPeriod, Waiting } from "@/lib/hero";
import { useHeroAsk } from "./hero-ask";
import { StreetView, SunnyStreet } from "./StreetView";

/** Brownie's living room at different times of day. The lamp matters most at night. */
const ROOMS: Record<DayPeriod, { wall: string; floor: string; lamp: number }> = {
  night: {
    wall: "radial-gradient(90% 60% at 16% 0%, rgb(255 196 120 / 0.5), transparent 62%), linear-gradient(180deg,#3a2c3d 0%,#251b34 55%,#171631 100%)",
    floor: "#2b2029",
    lamp: 1,
  },
  dawn: {
    wall: "radial-gradient(90% 60% at 16% 0%, rgb(255 214 150 / 0.7), transparent 62%), linear-gradient(180deg,#f3cfc0 0%,#e9b49c 60%,#d8967c 100%)",
    floor: "#b98163",
    lamp: 0.5,
  },
  day: {
    wall: "radial-gradient(90% 60% at 16% 0%, rgb(255 238 190 / 0.85), transparent 62%), linear-gradient(180deg,#fff0dc 0%,#fbd9b4 60%,#f0b88a 100%)",
    floor: "#c79b6e",
    lamp: 0.3,
  },
  dusk: {
    wall: "radial-gradient(90% 60% at 16% 0%, rgb(255 205 140 / 0.75), transparent 62%), linear-gradient(180deg,#f5b894 0%,#e98f6a 60%,#c96a4b 100%)",
    floor: "#a8714d",
    lamp: 0.7,
  },
};

const MOTES = [
  { left: 6, top: 26, size: 4, delay: 0, duration: 6 },
  { left: 14, top: 36, size: 3, delay: 1.2, duration: 7 },
  { left: 22, top: 24, size: 5, delay: 2.4, duration: 5.5 },
  { left: 10, top: 46, size: 3, delay: 3.1, duration: 6.5 },
  { left: 26, top: 40, size: 4, delay: 0.7, duration: 7.5 },
];

/** Raindrops sliding down the window glass. */
const GLASS_DROPS = [
  { left: 14, delay: 0, duration: 5.5 },
  { left: 30, delay: 1.8, duration: 6.5 },
  { left: 48, delay: 3.1, duration: 5 },
  { left: 63, delay: 0.9, duration: 7 },
  { left: 78, delay: 2.6, duration: 6 },
  { left: 90, delay: 4.2, duration: 5.8 },
];

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Props = {
  period: DayPeriod;
  /** Urgent animals still waiting for help. Null when the numbers could not be loaded. */
  waiting: Waiting | null;
};

/**
 * The hero picture. Brownie sits on his window seat, safe and clean in his collar. He watches the
 * animals waiting out in the rain, then turns and looks straight at you, as if asking you to help them.
 */
export function HeroScene({ period, waiting }: Props) {
  const t = useT();
  const { setAsking, hovering } = useHeroAsk();
  const room = ROOMS[period];
  const worried = (waiting?.count ?? 0) > 0;
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => false);

  const baseMood: BrownieMood = worried ? "thinking" : period === "night" ? "sleeping" : "happy";
  const [gaze, setGaze] = useState<"side" | "front">("side");
  const [hint, setHint] = useState(false);
  const [barked, setBarked] = useState(false);
  const barkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The story loop (about 9 seconds): look out of the window, turn to you, ask, look out again.
  // It pauses while you point at the Report button, and stays on "looking at you" with reduced motion.
  useEffect(() => {
    if (reduced || hovering) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    const toSide = () => {
      setGaze("side");
      setHint(false);
      setAsking(false);
      later(toFront, 4200);
    };
    const toFront = () => {
      setGaze("front");
      later(() => {
        if (worried) {
          setHint(true);
          setAsking(true);
        }
      }, 700);
      later(toSide, 4800);
    };
    later(toFront, 3200);
    return () => {
      timers.forEach(clearTimeout);
      setAsking(false);
    };
  }, [reduced, hovering, worried, setAsking]);

  useEffect(() => () => clearTimeout(barkTimer.current), []);

  const lookingAtYou = reduced || hovering || gaze === "front";
  const showHint = worried && (reduced || (hint && !hovering));
  const mood: BrownieMood = hovering && baseMood !== "sleeping" ? "happy" : baseMood;

  const onBark = () => {
    setBarked(true);
    clearTimeout(barkTimer.current);
    barkTimer.current = setTimeout(() => setBarked(false), 1000);
  };

  return (
    <div
      role="group"
      aria-label={t(`home.hero.period.${period}`)}
      className="relative isolate mx-auto aspect-[5/6] w-full max-w-md overflow-hidden rounded-[36px] shadow-pop ring-1 ring-black/10 sm:max-w-lg md:max-w-none"
      style={{ background: room.wall }}
    >
      {/* hanging lamp, its cone of light, and dust drifting in it */}
      <div aria-hidden="true" className="absolute left-[14%] top-0 h-[14%] w-px bg-black/30" />
      <div aria-hidden="true" className="absolute left-[10%] top-[14%] h-[3.5%] w-[9%] rounded-t-full bg-[#2b2029] shadow-[0_0_30px_10px_rgb(255_214_140/0.6)]" />
      <div
        aria-hidden="true"
        className="absolute left-[3%] top-[17.5%] h-[44%] w-[23%] bg-linear-to-b from-[#ffe3a8] to-transparent [clip-path:polygon(34%_0,66%_0,100%_100%,0_100%)]"
        style={{ opacity: 0.55 * room.lamp }}
      />
      {MOTES.map((m, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-[#fff3c4]"
          style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animation: `float-drift ${m.duration}s ease-in-out ${m.delay}s infinite` }}
        />
      ))}

      {/* the window: warm inside, cold rain outside */}
      <div
        role="img"
        aria-label={t(worried ? "home.hero.window.waiting" : "home.hero.window.safe")}
        className="absolute right-[4%] top-[8%] h-[54%] w-[50%] animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.2s_backwards]"
      >
        <div className="absolute inset-0 rounded-[50%_50%_10px_10px/24%_24%_10px_10px] bg-[#fff5e6] shadow-[0_16px_34px_-12px_rgb(0_0_0/0.5)]" />
        <div className="absolute inset-[3.4%] overflow-hidden rounded-[50%_50%_6px_6px/24%_24%_6px_6px] bg-[#0b1128]">
          {worried ? <StreetView animals={waiting?.animals ?? []} /> : <SunnyStreet />}
          {worried && (
            <>
              {GLASS_DROPS.map((d, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="absolute top-0 h-[5%] w-[3%] rounded-full bg-white/35 shadow-[inset_0_-1px_1px_rgb(255_255_255/0.5)]"
                  style={{ left: `${d.left}%`, animation: `drop-slide ${d.duration}s ease-in ${d.delay}s infinite` }}
                />
              ))}
              <span aria-hidden="true" className="absolute inset-0 bg-white" style={{ opacity: 0, animation: "lightning 9s linear 2s infinite" }} />
            </>
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent" />
        </div>
        {/* mullions */}
        <span aria-hidden="true" className="absolute bottom-[3.4%] left-[48.8%] top-[16%] w-[2.4%] bg-[#fff5e6]" />
        <span aria-hidden="true" className="absolute inset-x-[3.4%] top-[54%] h-[1.8%] bg-[#fff5e6]" />
      </div>
      {/* sill, curtains and rod */}
      <div aria-hidden="true" className="absolute right-[2%] top-[61.5%] h-[2.6%] w-[54%] rounded-md bg-[#f3e2c6] shadow-[0_6px_10px_-4px_rgb(0_0_0/0.4)]" />
      <div aria-hidden="true" className="absolute left-[42%] right-0 top-[5.5%] h-[1%] rounded-full bg-[#6b4a2b]" />
      {[{ side: "left-[42.5%]", origin: "origin-top" }, { side: "right-[0.5%]", origin: "origin-top" }].map((c) => (
        <div
          key={c.side}
          aria-hidden="true"
          className={`absolute top-[6.2%] h-[56%] w-[8%] rounded-b-[40%] bg-coral/85 shadow-[0_8px_14px_-6px_rgb(0_0_0/0.4)] animate-[sway_7s_ease-in-out_infinite] ${c.side} ${c.origin}`}
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgb(0 0 0 / 0.1) 0 3px, transparent 3px 10px)" }}
        />
      ))}

      {/* window seat */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[12%] shadow-[inset_0_14px_20px_-12px_rgb(0_0_0/0.35)]" style={{ background: room.floor }} />
      <div aria-hidden="true" className="absolute -left-[3%] bottom-[9.5%] h-[6.5%] w-[70%] rounded-full bg-linear-to-b from-coral to-[#c4401b] shadow-[0_8px_14px_-6px_rgb(0_0_0/0.5)]" />

      <Brownie
        mood={mood}
        gaze={baseMood === "sleeping" ? undefined : lookingAtYou ? "front" : "side"}
        gazeDir={1}
        pawUp={worried && lookingAtYou && !hovering}
        interactive
        collar
        label={t("home.hero.brownie")}
        onBark={onBark}
        className="absolute -left-[1%] bottom-[13%] w-[54%] animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.1s_backwards] overflow-visible"
      />

      {/* what Brownie says when he turns to you */}
      <p
        role="status"
        aria-hidden={!showHint}
        className={`glass absolute left-[3%] top-[20%] flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[13px] font-bold text-foreground transition duration-500 ease-spring sm:text-sm ${
          showHint ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-90 opacity-0"
        }`}
      >
        <PawPrint size={16} className="text-coral" aria-hidden="true" />
        {t("home.hero.ask")}
      </p>

      {waiting !== null && (
        <p
          role="status"
          className="glass absolute right-[4%] top-[66.5%] flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3.5 text-[12px] font-bold text-foreground animate-[pop-in_0.6s_cubic-bezier(0.34,1.4,0.64,1)_1.1s_backwards] sm:text-[13px]"
        >
          <span aria-hidden="true" className="relative grid size-2.5 shrink-0 place-items-center">
            <span className={`absolute size-2.5 rounded-full ${worried ? "animate-ping bg-coral/60" : "bg-green/40"}`} />
            <span className={`size-2.5 rounded-full ${worried ? "bg-coral" : "bg-green"}`} />
          </span>
          {worried ? t("home.hero.waiting", { n: waiting.count }) : t("home.hero.allSafe")}
        </p>
      )}

      <p
        aria-hidden="true"
        className={`absolute left-[8%] top-[30%] rounded-2xl bg-white px-3.5 py-2 font-heading text-lg font-extrabold text-midnight shadow-soft transition duration-300 ease-spring ${
          barked ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-75 opacity-0"
        }`}
      >
        {t("home.hero.bark")}
      </p>

      <div aria-hidden="true" className="story-grain pointer-events-none absolute inset-0 opacity-[0.06]" />
    </div>
  );
}
