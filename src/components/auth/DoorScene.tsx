"use client";

import { PawPrint } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Brownie } from "@/components/brownie/Brownie";
import { useT } from "@/i18n/client";

/** What Brownie is doing. `n` goes up every time, so the same mood twice in a row (two wrong codes) still plays again. */
export type LoginMood = { kind: "idle" | "watch" | "secret" | "wrong" | "happy"; n: number };

const WIDE = "(min-width: 1024px)";
const isWide = () => matchMedia(WIDE).matches;
const subscribeWide = (onChange: () => void) => {
  const mq = matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const FLOWERS = [
  { left: 6, bottom: 6, color: "#e4572e" },
  { left: 13, bottom: 3, color: "#fff7e0" },
  { left: 41, bottom: 5, color: "#f2b544" },
  { left: 52, bottom: 2.5, color: "#e4572e" },
  { left: 66, bottom: 6, color: "#fff7e0" },
  { left: 78, bottom: 3, color: "#f2b544" },
  { left: 90, bottom: 5.5, color: "#e4572e" },
];

/**
 * The sunny morning behind the login: sky, sun, slow clouds, rolling hills and a strip of grass with flowers.
 * It turns golden when `opened` (the door is open). Fills whatever box it is placed in.
 */
export function Landscape({ opened, className = "" }: { opened: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-linear-to-b from-[#8fbdee] via-[#cfe4f6] to-[#ffe9cf]" />
      <div className={`absolute inset-0 bg-linear-to-b from-[#f6a76e] via-[#f9cb94] to-[#fde8c8] transition-opacity duration-[1400ms] ${opened ? "opacity-100" : "opacity-0"}`} />

      {/* sun, with a soft glow */}
      <div className="absolute right-[9%] top-[7%] aspect-square w-[16%] min-w-[3.5rem] rounded-full bg-[#fff2bd] shadow-[0_0_80px_30px_rgb(255_220_120/0.65)]" />

      {/* slow clouds */}
      <div className="absolute left-[7%] top-[11%] h-[6%] w-[24%] animate-[cloud-drift_20s_ease-in-out_infinite] rounded-full bg-white/85 blur-[1px]" />
      <div className="absolute left-[30%] top-[21%] h-[4.5%] w-[17%] animate-[cloud-drift_26s_ease-in-out_-9s_infinite] rounded-full bg-white/70 blur-[1px]" />
      <div className="absolute right-[26%] top-[16%] h-[5%] w-[20%] animate-[cloud-drift_30s_ease-in-out_-15s_infinite] rounded-full bg-white/75 blur-[1px]" />

      {/* hills, far to near */}
      <div className="absolute -left-[12%] bottom-[11%] h-[36%] w-[72%] rounded-[50%] bg-[#bcdba2]" />
      <div className="absolute -right-[14%] bottom-[11%] h-[32%] w-[74%] rounded-[50%] bg-[#a3cf88]" />
      <div className="absolute left-[18%] bottom-[10%] h-[24%] w-[70%] rounded-[50%] bg-[#93c47a]" />

      {/* grass and flowers */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] bg-linear-to-b from-[#8fbf72] to-[#74a95c]" />
      {FLOWERS.map((f) => (
        <span key={f.left} className="absolute size-2 rounded-full shadow-[0_0_0_2px_rgb(255_255_255/0.6)] sm:size-2.5" style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, background: f.color }} />
      ))}
    </div>
  );
}

/**
 * The login picture: a little house with the "Volunteer entrance" door and warm light behind it. Brownie, in his green
 * volunteer cap, waits beside it and reacts to what you do (watching you type, bowing his head with both paws over his
 * eyes while you enter the code). When you are logged in the door swings open and the light pours out.
 *
 * It is a rounded picture with its own landscape. The form is a separate card: below it on a phone, beside it on a
 * laptop, and Brownie looks toward it. Size it with `className`.
 */
export function DoorScene({ mood, opened, className = "" }: { mood: LoginMood; opened: boolean; className?: string }) {
  const t = useT();
  const brownieMood = mood.kind === "wrong" ? "thinking" : "happy";
  // The form is below the picture on a phone and to its right on a laptop; Brownie looks toward it.
  const formIsBeside = useSyncExternalStore(subscribeWide, isWide, () => false);

  return (
    <div className={`relative isolate overflow-hidden rounded-[32px] shadow-pop ring-1 ring-black/10 ${className}`}>
      <Landscape opened={opened} />

      {/* the house: a roof, a wall, a window and the door */}
      <div aria-hidden="true" className="absolute bottom-[12%] left-1/2 h-[76%] w-[80%] -translate-x-1/2 lg:left-[44%] lg:w-[78%]">
        <div className="absolute -left-[5%] top-0 h-[28%] w-[110%] bg-linear-to-b from-[#e4572e] to-[#c4401b] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div
          className={`absolute inset-x-0 bottom-0 top-[27%] rounded-b-[10px] bg-linear-to-b shadow-[0_16px_30px_-14px_rgb(120_70_20/0.5)] transition-colors duration-[1400ms] ${
            opened ? "from-[#fbe3bd] to-[#f3cb97]" : "from-[#f8ddb8] to-[#efc690]"
          }`}
        />

        {/* window on the right, glowing */}
        <div className="absolute right-[12%] top-[40%] h-[22%] w-[18%] rounded-md bg-[#ffd98a] shadow-[0_0_24px_6px_rgb(255_200_110/0.5)] ring-4 ring-[#fff3dc]">
          <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#fff3dc]" />
          <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#fff3dc]" />
        </div>

        {/* the door: warm light behind it, and a panel that swings open on its left hinge. The words are painted on the door. */}
        <div className="absolute bottom-0 left-[10%] h-[58%] w-[40%] [perspective:900px]">
          <div className="absolute inset-0 rounded-t-[50%_32%] bg-linear-to-b from-[#ffe9b8] via-[#ffc874] to-[#ff9a52] shadow-[0_0_40px_12px_rgb(255_190_100/0.5)]" />
          <div
            className="absolute inset-0 origin-left rounded-t-[50%_32%] bg-linear-to-b from-[#b4602f] to-[#7a3a1c] shadow-[inset_0_0_0_4px_rgb(0_0_0/0.12)] transition-transform duration-[1300ms] ease-[cubic-bezier(0.5,0,0.2,1)]"
            style={{ transform: `rotateY(${opened ? -86 : -14}deg)` }}
          >
            <span className="absolute right-[12%] top-[55%] size-3 rounded-full bg-[#f2b544] shadow-[0_0_6px_rgb(242_181_68/0.9)]" />
            <span className="absolute inset-x-[12%] top-[11%] flex h-[36%] flex-col items-center justify-center gap-1 rounded-t-[50%_40%] border-2 border-[#ffd778]/45 bg-black/10 px-1 text-center">
              <PawPrint className="shrink-0 text-[#ffd778]" size={14} />
              <span className="font-heading text-[8px] font-extrabold uppercase leading-tight tracking-wide text-[#ffd778] [text-shadow:0_1px_2px_rgb(0_0_0/0.5)] sm:text-[10px] lg:text-[13px]">
                {t("login.sign")}
              </span>
            </span>
            <span className="absolute inset-x-[12%] top-[54%] h-[36%] rounded-md border-2 border-black/15" />
          </div>
        </div>
      </div>

      {/* light pouring out when the door is open */}
      <div
        aria-hidden="true"
        className={`absolute bottom-[8%] left-[32%] size-[95%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_226_160/0.95),rgb(255_190_100/0.35)_45%,transparent_70%)] transition duration-[1400ms] lg:left-[30%] ${
          opened ? "scale-125 opacity-100" : "scale-50 opacity-0"
        }`}
      />

      {/* path to the door and a doormat */}
      <div aria-hidden="true" className="absolute bottom-0 left-[15%] h-[13%] w-[30%] bg-linear-to-b from-[#ecd2a4] to-[#d8b985] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)] lg:left-[11%]" />
      <div aria-hidden="true" className="absolute bottom-[10%] left-[18%] h-[3%] w-[24%] rounded-sm bg-coral shadow-[0_3px_6px_-2px_rgb(0_0_0/0.4)] lg:left-[14%]" />

      {/* Brownie, beside the door */}
      <div className="absolute bottom-[4%] right-[6%] w-[36%] max-w-[11rem] animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.15s_backwards] lg:right-[3%] lg:max-w-[17rem]">
        <p
          aria-hidden={mood.kind !== "secret"}
          className={`glass absolute -top-1 -left-[28%] z-10 whitespace-nowrap rounded-2xl px-3 py-1.5 text-[11px] font-bold text-foreground transition duration-300 ease-spring sm:text-[13px] ${
            mood.kind === "secret" ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-90 opacity-0"
          }`}
        >
          {t("login.shh")}
        </p>
        <Brownie
          mood={brownieMood}
          cap
          gaze={mood.kind === "watch" ? (formIsBeside ? "side" : "down") : undefined}
          gazeDir={1}
          cover={mood.kind === "secret"}
          shake={mood.kind === "wrong" ? { id: mood.n } : undefined}
          bark={mood.kind === "happy" ? { id: mood.n } : undefined}
          bow={mood.kind === "happy"}
          interactive
          collar
          label={t("home.hero.brownie")}
          className="block h-auto w-full overflow-visible drop-shadow-[0_6px_8px_rgb(0_0_0/0.25)]"
        />
      </div>
    </div>
  );
}
