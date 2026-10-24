"use client";

import { useEffect, useState, type ReactNode } from "react";

// Fixed values (not random) so the server and the browser draw the same rain.
const DROPS = Array.from({ length: 20 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  delay: -((i * 0.37) % 1.4),
  duration: 0.8 + ((i * 13) % 7) / 10,
}));

const SILHOUETTE = "#04061a";
const RIM = "#3b4b8f";

/** Glowing eyes: the only light on a street animal in the dark. */
function Eyes({ points }: { points: Array<[number, number]> }) {
  return (
    <g style={{ filter: "drop-shadow(0 0 3px #ffe9a8)" }} className="animate-[glint_4.5s_ease-in-out_infinite]">
      {points.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" fill="#FFE9A8" />
      ))}
    </g>
  );
}

function SadDog() {
  return (
    <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden="true">
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".8">
        <path d="M26 80 Q10 76 12 62" fill="none" stroke={SILHOUETTE} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="50" cy="72" rx="27" ry="20" />
        <rect x="62" y="80" width="9" height="17" rx="4.5" />
        <rect x="37" y="84" width="9" height="13" rx="4.5" />
        <g className="origin-[78px_50px] animate-[sway_4s_ease-in-out_infinite]">
          <circle cx="78" cy="58" r="13" />
          <ellipse cx="91" cy="63" rx="8" ry="5" />
          <path d="M70 50 Q60 58 67 69 Q75 62 77 51Z" />
        </g>
      </g>
      <Eyes points={[[82, 56]]} />
    </svg>
  );
}

function SadCat() {
  return (
    <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden="true">
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".8">
        <path d="M80 86 Q106 82 98 60" fill="none" stroke={SILHOUETTE} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="62" cy="76" rx="21" ry="22" />
        <g className="origin-[44px_52px] animate-[sway_3.6s_ease-in-out_infinite]">
          <circle cx="44" cy="52" r="13" />
          <polygon points="32,44 35,28 45,40" />
          <polygon points="45,40 54,28 57,44" />
        </g>
      </g>
      <Eyes points={[[39, 52], [49, 52]]} />
    </svg>
  );
}

function Puppies() {
  return (
    <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden="true">
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".8">
        <ellipse cx="42" cy="84" rx="17" ry="11" />
        <circle cx="58" cy="76" r="10" />
        <path d="M52 69 Q46 74 50 82 Q56 77 57 70Z" />
        <ellipse cx="76" cy="87" rx="14" ry="9" />
        <circle cx="88" cy="80" r="8.5" />
        <path d="M83 74 Q78 78 81 85 Q86 81 87 75Z" />
      </g>
      <Eyes points={[[61, 75], [90, 79]]} />
    </svg>
  );
}

const SLIDES: ReactNode[] = [<SadDog key="dog" />, <SadCat key="cat" />, <Puppies key="pups" />];

/** A little rainy street at night with the animals Brownie is worrying about, one after another. */
export function RainyThought() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-b from-[#0b1128] via-[#1a2550] to-[#2e3b6b]" aria-hidden="true">
      {/* street lamp */}
      <div className="absolute left-[10%] top-[8%] h-[84%] w-[26%]">
        <div className="absolute left-0 top-0 size-full rounded-full bg-[radial-gradient(circle,rgb(255_233_168/0.55),transparent_62%)]" />
        <div className="absolute left-[44%] top-[28%] h-full w-[5%] rounded bg-[#2f3a5e]" />
        <div className="absolute left-[30%] top-[24%] h-[6%] w-[36%] rounded-full bg-[#fff0bf]" />
      </div>

      {/* rain */}
      {DROPS.map((d, i) => (
        <span
          key={i}
          className="absolute -top-[10%] h-[12%] w-px bg-[#a9bee6]/60"
          style={{ left: `${d.left}%`, animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite` }}
        />
      ))}

      {/* the animals */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-x-[12%] bottom-[10%] h-[58%] transition duration-700 ease-out ${
            i === active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {slide}
        </div>
      ))}

      {/* wet road with a puddle of lamplight */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] bg-linear-to-b from-[#1b2342] to-[#0b1024]" />
      <div className="absolute bottom-[3%] left-[8%] h-[5%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgb(255_233_168/0.4),transparent_70%)]" />
    </div>
  );
}

/** Shown when nobody is waiting: warm, bright and calm. */
export function SafeThought() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-b from-[#ffd9a0] via-[#ffe7c2] to-[#fff3df]" aria-hidden="true">
      <div className="absolute right-[12%] top-[12%] size-[26%] rounded-full bg-[#fff0b8] shadow-[0_0_40px_14px_rgb(255_215_106/0.6)]" />
      {[
        { left: "18%", top: "46%", color: "#e4572e", delay: "0s" },
        { left: "44%", top: "30%", color: "#f2b544", delay: "0.8s" },
        { left: "66%", top: "52%", color: "#e4572e", delay: "1.6s" },
      ].map((h) => (
        <svg
          key={h.left}
          viewBox="-22 -18 44 40"
          className="absolute w-[14%] animate-[bob_3s_ease-in-out_infinite]"
          style={{ left: h.left, top: h.top, animationDelay: h.delay }}
        >
          <path d="M0 -6 C -6 -16 -20 -8 -12 4 L0 16 L12 4 C 20 -8 6 -16 0 -6Z" fill={h.color} />
        </svg>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#d9a066]/60" />
    </div>
  );
}
