"use client";

import { useEffect, useRef, useState } from "react";
import { Brownie, type BrownieMood } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";
import type { DayPeriod } from "@/lib/hero";
import { RainyThought, SafeThought } from "./ThoughtBubble";

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
  { left: 8, top: 24, size: 4, delay: 0, duration: 6 },
  { left: 16, top: 34, size: 3, delay: 1.2, duration: 7 },
  { left: 24, top: 20, size: 5, delay: 2.4, duration: 5.5 },
  { left: 12, top: 44, size: 3, delay: 3.1, duration: 6.5 },
  { left: 28, top: 38, size: 4, delay: 0.7, duration: 7.5 },
  { left: 20, top: 52, size: 3, delay: 4, duration: 6 },
];

type Props = {
  period: DayPeriod;
  mood: BrownieMood;
  /** Urgent animals still waiting for help. Null when the numbers could not be loaded. */
  waiting: number | null;
};

/**
 * The hero picture. Brownie is safe at home, clean and wearing his collar, but he is sad:
 * the thought bubble shows the animals still out in the rain.
 */
export function HeroScene({ period, mood, waiting }: Props) {
  const t = useT();
  const room = ROOMS[period];
  const worried = (waiting ?? 0) > 0;
  const [barked, setBarked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onBark = () => {
    setBarked(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBarked(false), 1000);
  };

  return (
    <div
      role="group"
      aria-label={t(`home.hero.period.${period}`)}
      className="relative isolate mx-auto aspect-[5/6] w-full max-w-md overflow-hidden rounded-[36px] shadow-pop ring-1 ring-black/10 sm:max-w-lg md:max-w-none"
      style={{ background: room.wall }}
    >
      {/* hanging lamp with its cone of light and drifting dust motes */}
      <div aria-hidden="true" className="absolute left-[14%] top-0 h-[16%] w-px bg-black/30" />
      <div aria-hidden="true" className="absolute left-[10%] top-[16%] h-[3.5%] w-[9%] rounded-t-full bg-[#2b2029] shadow-[0_0_30px_10px_rgb(255_214_140/0.6)]" />
      <div
        aria-hidden="true"
        className="absolute left-[4%] top-[19.5%] h-[40%] w-[21%] bg-linear-to-b from-[#ffe3a8] to-transparent [clip-path:polygon(34%_0,66%_0,100%_100%,0_100%)]"
        style={{ opacity: 0.55 * room.lamp }}
      />
      {MOTES.map((m, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-[#fff3c4]"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            animation: `float-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}

      {/* floor and rug */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[15%] shadow-[inset_0_14px_20px_-12px_rgb(0_0_0/0.35)]"
        style={{ background: `repeating-linear-gradient(90deg, transparent 0 46px, rgb(0 0 0 / 0.07) 46px 48px), ${room.floor}` }}
      />
      <div aria-hidden="true" className="absolute bottom-[3.5%] left-[1%] h-[8%] w-[62%] rounded-[50%] bg-linear-to-r from-coral/55 to-brownie/55" />

      {/* thought bubble: the trail leads from Brownie's head up to the street he is worrying about */}
      <div className="absolute right-[4%] top-[3%] w-[56%] animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.5s_backwards]">
        <div className="animate-[bob_5s_ease-in-out_infinite]">
          <div className="relative aspect-[1.35] overflow-hidden rounded-[48%_52%_46%_54%/58%_54%_46%_42%] bg-white shadow-[0_18px_40px_-14px_rgb(0_0_0/0.5)] ring-[5px] ring-white/85">
            {worried ? <RainyThought /> : <SafeThought />}
          </div>
        </div>
      </div>
      {[
        { left: "41%", top: "38.5%", size: "5.2%", delay: "0.2s" },
        { left: "37.5%", top: "41.5%", size: "3.6%", delay: "0.1s" },
        { left: "35%", top: "44%", size: "2.4%", delay: "0s" },
      ].map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute aspect-square rounded-full bg-white shadow-soft ring-2 ring-white/60 animate-[pop-in_0.5s_cubic-bezier(0.34,1.4,0.64,1)_backwards]"
          style={{ left: d.left, top: d.top, width: d.size, animationDelay: `${0.25 + i * 0.12}s` }}
        >
          <span className="block size-full rounded-full" style={{ animation: `trail-pulse 2.4s ease-in-out ${d.delay} infinite` }} />
        </span>
      ))}

      {waiting !== null && (
        <p
          role="status"
          className="glass absolute right-[4%] top-[39.5%] flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3.5 text-[12px] font-bold text-foreground animate-[pop-in_0.6s_cubic-bezier(0.34,1.4,0.64,1)_1.1s_backwards] sm:text-[13px]"
        >
          <span aria-hidden="true" className="relative grid size-2.5 shrink-0 place-items-center">
            <span className={`absolute size-2.5 rounded-full ${worried ? "animate-ping bg-coral/60" : "bg-green/40"}`} />
            <span className={`size-2.5 rounded-full ${worried ? "bg-coral" : "bg-green"}`} />
          </span>
          {worried ? t("home.hero.waiting", { n: waiting }) : t("home.hero.allSafe")}
        </p>
      )}

      <Brownie
        mood={mood}
        interactive
        collar
        label={t("home.hero.brownie")}
        onBark={onBark}
        className="absolute bottom-[2%] left-[2%] w-[56%] animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.15s_backwards] overflow-visible"
      />

      <p
        aria-hidden="true"
        className={`absolute left-[5%] top-[42%] rounded-2xl bg-white px-3.5 py-2 font-heading text-lg font-extrabold text-midnight shadow-soft transition duration-300 ease-spring ${
          barked ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-75 opacity-0"
        }`}
      >
        {t("home.hero.bark")}
      </p>

      <div aria-hidden="true" className="story-grain pointer-events-none absolute inset-0 opacity-[0.06]" />
    </div>
  );
}
