import type { StreetAnimal } from "@/lib/hero";

// Fixed values (not random) so the server and the browser draw the same rain.
const DROPS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  delay: -((i * 0.37) % 1.4),
  duration: 0.8 + ((i * 13) % 7) / 10,
}));

const SILHOUETTE = "#04061a";
const RIM = "#4a5ca3";

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

const svgProps = { viewBox: "0 0 120 100", className: "h-full w-full", "aria-hidden": true as const };

function SadDog() {
  return (
    <svg {...svgProps}>
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".9">
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
    <svg {...svgProps}>
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".9">
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

/** One puppy: round head, two floppy ears, a small snout, a short tail. */
function Puppy({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-18 6 Q-27 2 -25 -8" fill="none" stroke={SILHOUETTE} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="0" cy="8" rx="18" ry="12" />
      <rect x="-8" y="14" width="7" height="10" rx="3.5" />
      <rect x="6" y="14" width="7" height="10" rx="3.5" />
      <circle cx="8" cy="-8" r="12" />
      <ellipse cx="17" cy="-4" rx="6" ry="4" />
      <path d="M-1 -16 Q-9 -8 -3 2 Q4 -4 5 -15Z" />
      <path d="M13 -18 Q21 -14 18 -4 Q12 -9 10 -16Z" />
    </g>
  );
}

function Puppies() {
  return (
    <svg {...svgProps}>
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".9">
        <Puppy x={38} y={72} scale={1} />
        <Puppy x={84} y={80} scale={0.78} />
      </g>
      <Eyes points={[[42, 62], [50, 62], [86, 71], [92, 71]]} />
    </svg>
  );
}

function Kitten({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M16 12 Q32 8 28 -6" fill="none" stroke={SILHOUETTE} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="0" cy="8" rx="15" ry="14" />
      <circle cx="-2" cy="-8" r="11" />
      <polygon points="-12,-14 -10,-26 -2,-17" />
      <polygon points="-2,-17 6,-26 8,-13" />
    </g>
  );
}

function Kittens() {
  return (
    <svg {...svgProps}>
      <g fill={SILHOUETTE} stroke={RIM} strokeWidth=".9">
        <Kitten x={38} y={74} scale={1} />
        <Kitten x={82} y={82} scale={0.78} />
      </g>
      <Eyes points={[[34, 66], [41, 66], [79, 74], [85, 74]]} />
    </svg>
  );
}

const ART: Record<StreetAnimal, () => React.JSX.Element> = { dog: SadDog, cat: SadCat, pups: Puppies, kittens: Kittens };

// Where the animals stand along the pavement (centre, in percent of the window) for 1 to 4 of them.
const SLOTS: Record<number, number[]> = { 1: [58], 2: [42, 74], 3: [32, 56, 80], 4: [20, 41, 62, 83] };

/**
 * The street outside the window on a rainy night. Each waiting animal steps into the lamplight
 * one after another. Everything here is drawn, so it costs no image downloads.
 */
export function StreetView({ animals }: { animals: StreetAnimal[] }) {
  const shown = animals.slice(0, 4);
  const slots = SLOTS[shown.length] ?? [];
  const width = shown.length >= 4 ? "w-[27%]" : shown.length === 3 ? "w-[32%]" : "w-[42%]";

  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-b from-[#0b1128] via-[#1a2550] to-[#2e3b6b]" aria-hidden="true">
      {/* far buildings with a few lit windows */}
      <div className="absolute inset-x-0 bottom-[14%] flex h-[46%] items-end gap-[3%] px-[3%] opacity-70">
        {[62, 88, 54, 78, 66].map((h, i) => (
          <div key={i} className="relative flex-1 rounded-t-sm bg-[#141d44]" style={{ height: `${h}%` }}>
            <span className="absolute left-[24%] top-[18%] h-[7%] w-[22%] rounded-[1px] bg-[#f5c76a]/60" />
            {i % 2 === 0 && <span className="absolute right-[22%] top-[44%] h-[7%] w-[22%] rounded-[1px] bg-[#f5c76a]/40" />}
          </div>
        ))}
      </div>

      {/* street lamp */}
      <div className="absolute left-[2%] top-[6%] h-[88%] w-[34%]">
        <div className="absolute left-0 top-0 size-full rounded-full bg-[radial-gradient(circle,rgb(255_233_168/0.5),transparent_62%)]" />
        <div className="absolute left-[45%] top-[26%] h-full w-[5%] rounded bg-[#2f3a5e]" />
        <div className="absolute left-[30%] top-[22%] h-[4.5%] w-[36%] rounded-full bg-[#fff0bf]" />
      </div>

      {/* rain */}
      {DROPS.map((d, i) => (
        <span
          key={i}
          className="absolute -top-[10%] h-[10%] w-px bg-[#a9bee6]/60"
          style={{ left: `${d.left}%`, animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite` }}
        />
      ))}

      {/* wet pavement, a puddle of lamplight */}
      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-linear-to-b from-[#1b2342] to-[#0b1024]" />
      <div className="absolute bottom-[3%] left-[10%] h-[5%] w-[44%] rounded-full bg-[radial-gradient(ellipse,rgb(255_233_168/0.42),transparent_70%)]" />

      {/* the animals, stepping into the light one by one */}
      {shown.map((kind, i) => {
        const Art = ART[kind];
        return (
          <div
            key={`${kind}-${i}`}
            className={`absolute bottom-[8%] aspect-[1.2] -translate-x-1/2 ${width}`}
            style={{ left: `${slots[i]}%`, animation: `rise-in 0.9s ease-out ${0.5 + i * 0.7}s backwards` }}
          >
            <Art />
          </div>
        );
      })}
    </div>
  );
}

/** The window when nobody is waiting: a calm, sunny street. */
export function SunnyStreet() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-linear-to-b from-[#8fc4f2] via-[#cfe6f8] to-[#fff1d6]" aria-hidden="true">
      <div className="absolute right-[14%] top-[10%] size-[24%] rounded-full bg-[#fff0b8] shadow-[0_0_40px_14px_rgb(255_215_106/0.6)]" />
      <div className="absolute left-[8%] top-[22%] h-[7%] w-[34%] rounded-full bg-white/80 blur-[1px]" />
      <div className="absolute inset-x-0 bottom-[14%] flex h-[34%] items-end gap-[3%] px-[3%]">
        {[70, 100, 60, 84].map((h, i) => (
          <div key={i} className="relative flex-1 rounded-t-sm bg-[#e7c9a2]" style={{ height: `${h}%` }}>
            <span className="absolute left-[24%] top-[20%] h-[12%] w-[26%] rounded-[1px] bg-[#fff6dc]" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#c8a578]" />
      {[
        { left: "22%", top: "42%", color: "#e4572e", delay: "0s" },
        { left: "52%", top: "34%", color: "#f2b544", delay: "0.8s" },
        { left: "70%", top: "50%", color: "#e4572e", delay: "1.6s" },
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
    </div>
  );
}
