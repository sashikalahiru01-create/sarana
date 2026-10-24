"use client";

import { PawPrint } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Brownie, type BrownieMood } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";
import type { DayPeriod } from "@/lib/hero";

const SKIES: Record<DayPeriod, { sky: string; far: string; near: string; ground: string }> = {
  night: { sky: "linear-gradient(180deg,#0b1128 0%,#1a2550 55%,#2e3b6b 100%)", far: "#18214a", near: "#101839", ground: "#0b1024" },
  dawn: { sky: "linear-gradient(180deg,#8fa8d8 0%,#f7b999 62%,#fde3c6 100%)", far: "#d99a7e", near: "#b9785a", ground: "#a8744f" },
  day: { sky: "linear-gradient(180deg,#6fa8e8 0%,#bfdcf7 62%,#e8f3fd 100%)", far: "#8fc27a", near: "#6aa35c", ground: "#c79b6e" },
  dusk: { sky: "linear-gradient(180deg,#f29e6b 0%,#f8c590 55%,#fce4c6 100%)", far: "#c9714a", near: "#a85a38", ground: "#a57a52" },
};

const STARS = [
  [12, 10, 2], [26, 22, 1.5], [40, 8, 2], [58, 18, 1.5], [70, 6, 2], [84, 24, 1.5], [18, 34, 1.5], [92, 12, 2],
];

type Props = {
  period: DayPeriod;
  mood: BrownieMood;
  /** The live line shown above Brownie, or null when the numbers could not be loaded. */
  bubble: string | null;
  bubbleTone: "waiting" | "safe";
};

/** The hero picture: Brownie on a hill under the sky of the current time of day in Sri Lanka. */
export function HeroScene({ period, mood, bubble, bubbleTone }: Props) {
  const t = useT();
  const sky = SKIES[period];
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
      className="relative isolate mx-auto aspect-[5/6] w-full max-w-md overflow-hidden rounded-[32px] shadow-pop ring-1 ring-black/5 sm:max-w-lg md:max-w-none"
      style={{ background: sky.sky }}
    >
      {/* sun or moon */}
      {period === "night" ? (
        <>
          <div aria-hidden="true" className="absolute right-[14%] top-[12%] size-16 rounded-full bg-[#f4f1e8] shadow-[0_0_60px_18px_rgb(244_241_232/0.25)]">
            <span className="absolute left-3 top-4 size-3 rounded-full bg-black/8" />
            <span className="absolute bottom-3 right-4 size-4 rounded-full bg-black/8" />
          </div>
          {STARS.map(([x, y, r]) => (
            <span key={`${x}-${y}`} aria-hidden="true" className="absolute rounded-full bg-white/80" style={{ left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2 }} />
          ))}
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute size-20 rounded-full bg-[#fff0b8] shadow-[0_0_70px_28px_rgb(255_215_106/0.6)]"
          style={
            period === "day"
              ? { right: "14%", top: "10%" }
              : period === "dawn"
                ? { left: "12%", bottom: "46%", background: "#ffe08a" }
                : { right: "12%", bottom: "46%", background: "#ffb870", boxShadow: "0 0 70px 28px rgb(255 160 90 / 0.55)" }
          }
        />
      )}

      {/* hills and ground */}
      <svg aria-hidden="true" viewBox="0 0 500 600" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[58%] w-full">
        <path d="M0 150 Q110 70 230 130 T500 110 V600 H0Z" fill={sky.far} />
        <path d="M0 230 Q140 150 270 215 T500 190 V600 H0Z" fill={sky.near} />
        <path d="M0 420 Q250 380 500 420 V600 H0Z" fill={sky.ground} />
      </svg>

      {/* paw prints walking to the right edge */}
      <div aria-hidden="true" className="absolute bottom-[7%] right-[6%] flex gap-3 text-black/20">
        {[0, 1, 2].map((i) => (
          <PawPrint key={i} size={20} style={{ rotate: "80deg", translate: `0 ${i % 2 ? 8 : -4}px` }} />
        ))}
      </div>

      {bubble && (
        <p
          role="status"
          className="glass absolute left-3 top-3 right-3 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-foreground sm:left-4 sm:top-4 sm:right-auto sm:text-sm"
        >
          <span aria-hidden="true" className="relative grid size-2.5 shrink-0 place-items-center">
            <span className={`absolute size-2.5 rounded-full ${bubbleTone === "waiting" ? "animate-ping bg-coral/60" : "bg-green/40"}`} />
            <span className={`size-2.5 rounded-full ${bubbleTone === "waiting" ? "bg-coral" : "bg-green"}`} />
          </span>
          {bubble}
        </p>
      )}

      <Brownie
        mood={mood}
        interactive
        dusty={mood === "worried"}
        collar={mood !== "worried"}
        label={t("home.hero.brownie")}
        onBark={onBark}
        className="absolute bottom-[3%] left-1/2 w-[68%] -translate-x-1/2 overflow-visible"
      />

      <p
        aria-hidden="true"
        className={`absolute left-[8%] top-[34%] rounded-2xl bg-white px-3.5 py-2 font-heading text-lg font-extrabold text-midnight shadow-soft transition duration-300 ease-spring ${
          barked ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-75 opacity-0"
        }`}
      >
        {t("home.hero.bark")}
      </p>
    </div>
  );
}
