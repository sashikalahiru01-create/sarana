"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";

/** thinking: clean and safe at home, but sad, looking up at the animals still out in the rain. */
export type BrownieMood = "worried" | "thinking" | "happy" | "sleeping";

type Props = {
  mood: BrownieMood;
  /** Accessible name. Pass "" to hide Brownie from screen readers (purely decorative). */
  label?: string;
  /** Green collar with a gold tag. Only a home gives him one. */
  collar?: boolean;
  /** Street dust and mud. */
  dusty?: boolean;
  /** Eyes follow the pointer, tapping or pressing Enter makes him bark. */
  interactive?: boolean;
  onBark?: () => void;
  /**
   * Where he looks: "side" turns his head and eyes toward gazeDir (e.g. out of a window),
   * "front" faces the viewer with a lifted ear. Leave undefined for the mood's default pose.
   */
  gaze?: "front" | "side";
  /** Side to look at when gaze is "side": 1 = the viewer's right, -1 = the left. */
  gazeDir?: 1 | -1;
  /** Lift the paw, as if pointing at something. */
  pawUp?: boolean;
  /** Which way the lifted paw points: 1 = the viewer's right (the default), -1 = the left. */
  pawDir?: 1 | -1;
  /** Bow politely, nodding again and again ("please do it"). */
  bow?: boolean;
  className?: string;
};

/** Where each mood puts the joints. Same rig as the story: ears, head and tail pivot on fixed points. */
const POSES: Record<BrownieMood, { ear: number; head: number; tail: number }> = {
  worried: { ear: -105, head: -6, tail: 62 },
  thinking: { ear: -40, head: 9, tail: 56 },
  happy: { ear: 0, head: 4, tail: 20 },
  sleeping: { ear: -70, head: 16, tail: 48 },
};

/**
 * Brownie, the Sarana mascot. A tan street dog built as an SVG rig with fixed joints:
 * the ear joint sits on the head outline, the head pivots at the neck, the tail at its root.
 */
export function Brownie({ mood, label = "Brownie", collar = false, dusty = false, interactive = false, onBark, gaze, gazeDir = 1, pawUp = false, pawDir = gazeDir, bow = false, className }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef<SVGSVGElement>(null);
  const moodRef = useRef(mood);
  const applyMoodRef = useRef<((m: BrownieMood, immediate: boolean) => void) | null>(null);
  const onBarkRef = useRef(onBark);
  const gazeRef = useRef({ gaze, gazeDir, pawUp, pawDir });
  const bowRef = useRef(bow);
  const applyBowRef = useRef<((on: boolean) => void) | null>(null);
  const applyGazeRef = useRef<((immediate: boolean) => void) | null>(null);

  useEffect(() => {
    onBarkRef.current = onBark;
  }, [onBark]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const part = (name: string) => root.querySelector<SVGElement>(`[data-part="${name}"]`)!;
    const cleanups: Array<() => void> = [];
    let disposed = false;

    const ctx = gsap.context(() => {
      const pose = { ear: -105, earKick: 0, head: -6, headX: 0, headY: 0, tail: 62, wag: 0, breathe: 1, paw: 0, bow: 0 };
      const earEl = part("earL");
      const headEl = part("head");
      const tailEl = part("tail");
      const bodyEl = part("body");
      const pawEl = part("pawR");

      const applyPose = () => {
        const b = pose.breathe;
        const lift = (b - 1) * 122;
        bodyEl.setAttribute("transform", `translate(0 ${350 * (1 - b)}) scale(1 ${b})`);
        headEl.setAttribute("transform", `translate(${pose.headX} ${pose.headY + pose.bow * 24 - lift}) rotate(${pose.head + pose.bow * 5} 200 240)`);
        pawEl.setAttribute("transform", `rotate(${pose.paw} 235 302)`);
        earEl.setAttribute("transform", `rotate(${pose.ear + pose.earKick} 152 112)`);
        tailEl.setAttribute("transform", `translate(0 ${-(b - 1) * 50}) rotate(${pose.tail + pose.wag} 282 300)`);
      };
      applyPose();
      gsap.ticker.add(applyPose);
      cleanups.push(() => gsap.ticker.remove(applyPose));

      const wag = gsap.fromTo(pose, { wag: 0 }, { wag: -34, duration: 0.2, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true });
      const zzz = part("zzz");
      const pupils = [part("pupilL"), part("pupilR")];
      const pupilTo = pupils.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
      }));
      const lookAt = (x: number, y: number, immediate: boolean) => {
        if (immediate) gsap.set(pupils, { x, y });
        else pupilTo.forEach((p) => (p.x(x), p.y(y)));
      };

      // Ambient life (off with reduced motion)
      if (!reduce) {
        gsap.to(pose, { breathe: 1.022, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        const blink = () => {
          if (moodRef.current === "sleeping") return void gsap.delayedCall(1, blink);
          gsap.to(root.querySelectorAll('[data-part="eyeL"],[data-part="eyeR"]'), {
            scaleY: 0.08,
            transformOrigin: "50% 50%",
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              if (!disposed) gsap.delayedCall(2.5 + Math.random() * 3, blink);
            },
          });
        };
        gsap.delayedCall(2, blink);
        gsap.to(part("tear"), { y: 22, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.in", repeatDelay: 1.2 });
        gsap.to(zzz, { y: -10, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      // Mood changes move the joints and swap the face
      const faces = {
        sadFace: part("sadFace"),
        sadMouth: part("sadMouth"),
        happyFace: part("happyFace"),
        happyMouth: part("happyMouth"),
        eyes: [part("eyeL"), part("eyeR")],
        closedEyes: part("closedEyes"),
        zzz,
      };
      applyMoodRef.current = (m, immediate) => {
        const target = POSES[m];
        const d = immediate ? 0 : 0.7;
        gsap.to(pose, { ear: target.ear, head: target.head, tail: target.tail, duration: d, ease: m === "happy" ? "elastic.out(1,.5)" : "power2.out", overwrite: "auto" });
        const sad = m === "worried" || m === "thinking" ? 1 : 0;
        const happy = 1 - sad;
        gsap.to([faces.sadFace, faces.sadMouth], { opacity: sad, duration: d / 2 });
        gsap.to([faces.happyFace, faces.happyMouth], { opacity: happy, duration: d / 2 });
        gsap.to(faces.eyes, { opacity: m === "sleeping" ? 0 : 1, duration: d / 2 });
        gsap.to(faces.closedEyes, { opacity: m === "sleeping" ? 1 : 0, duration: d / 2 });
        gsap.to(faces.zzz, { opacity: m === "sleeping" ? 1 : 0, duration: d / 2 });
        lookAt(0, 0, immediate);
        if (m === "happy" && !reduce) wag.play();
        else wag.pause();
        if (m !== "happy") gsap.to(pose, { wag: 0, duration: 0.3 });
      };

      // Gaze: turn the head and eyes toward the side, or face the viewer. Runs after the mood so it wins.
      applyGazeRef.current = (immediate) => {
        const { gaze: g, gazeDir: dir, pawUp: up, pawDir: pdir } = gazeRef.current;
        const base = POSES[moodRef.current];
        const d = immediate ? 0 : 0.6;
        if (g) {
          const side = g === "side";
          gsap.to(pose, {
            headX: side ? 12 * dir : 0,
            head: side ? dir * (Math.abs(base.head) + 3) : dir * -3,
            ear: side ? base.ear : Math.min(0, base.ear + 24), // facing you: one ear lifts
            duration: d,
            ease: "power2.inOut",
            overwrite: "auto",
          });
          lookAt(side ? 7 * dir : 0, side ? -1 : 1, immediate);
        }
        gsap.to(pose, { paw: up ? -54 * pdir : 0, duration: d * 0.9, ease: up ? "back.out(2.2)" : "power2.out", overwrite: "auto" });
      };
      let bowTween: gsap.core.Tween | null = null;
      applyBowRef.current = (on) => {
        bowTween?.kill();
        bowTween = null;
        if (!on) {
          gsap.to(pose, { bow: 0, duration: 0.4, ease: "power2.out" });
        } else if (reduce) {
          gsap.to(pose, { bow: 1, duration: 0 });
        } else {
          bowTween = gsap.fromTo(pose, { bow: 0.15 }, { bow: 1, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
        }
      };
      applyMoodRef.current(moodRef.current, true);
      applyGazeRef.current(true);
      applyBowRef.current(bowRef.current);

      if (!interactive) return;

      // Eyes follow the pointer (or touch point), except while he is looking out to the side
      const movers = (["L", "R"] as const).map((side, i) => ({
        socket: part(`socket${side}`),
        to: pupilTo[i],
      }));
      const look = (cx: number, cy: number) => {
        if (moodRef.current === "sleeping" || gazeRef.current.gaze === "side") return;
        movers.forEach((m) => {
          const r = m.socket.getBoundingClientRect();
          const ex = r.left + r.width / 2;
          const ey = r.top + r.height / 2;
          const a = Math.atan2(cy - ey, cx - ex);
          const dist = Math.min(1, Math.hypot(cx - ex, cy - ey) / 220);
          m.to.x(Math.cos(a) * 5 * dist);
          m.to.y(Math.sin(a) * 4.5 * dist);
        });
      };
      const onPointer = (e: PointerEvent) => look(e.clientX, e.clientY);
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) look(t.clientX, t.clientY);
      };
      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("touchstart", onTouch, { passive: true });
      cleanups.push(() => {
        removeEventListener("pointermove", onPointer);
        removeEventListener("touchstart", onTouch);
      });

      // Bark: open mouth, small head bounce, ear flick
      const hit = part("hit");
      const barkMouth = part("barkMouth");
      const bark = () => {
        const mouths = [faces.sadMouth, faces.happyMouth];
        const prev = mouths.map((m) => Number(gsap.getProperty(m, "opacity")));
        gsap.killTweensOf(barkMouth);
        gsap.set(mouths, { opacity: 0 });
        gsap.set(barkMouth, { opacity: 1 });
        gsap.fromTo(pose, { headY: 0 }, { headY: -8, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
        gsap.timeline().to(pose, { earKick: 60, duration: 0.2 }).to(pose, { earKick: 0, duration: 0.8, ease: "elastic.out(1,.35)", delay: 0.2 });
        gsap.delayedCall(0.45, () => {
          gsap.set(barkMouth, { opacity: 0 });
          mouths.forEach((m, i) => gsap.set(m, { opacity: prev[i] }));
        });
        onBarkRef.current?.();
      };
      const onKey = (e: Event) => {
        const key = (e as KeyboardEvent).key;
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          bark();
        }
      };
      hit.addEventListener("click", bark);
      hit.addEventListener("keydown", onKey);
      cleanups.push(() => {
        hit.removeEventListener("click", bark);
        hit.removeEventListener("keydown", onKey);
      });
    }, root);

    return () => {
      disposed = true;
      applyMoodRef.current = null;
      applyGazeRef.current = null;
      applyBowRef.current = null;
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [interactive]);

  useEffect(() => {
    moodRef.current = mood;
    applyMoodRef.current?.(mood, false);
    applyGazeRef.current?.(false);
  }, [mood]);

  useEffect(() => {
    gazeRef.current = { gaze, gazeDir, pawUp, pawDir };
    applyGazeRef.current?.(false);
  }, [gaze, gazeDir, pawUp, pawDir]);

  useEffect(() => {
    bowRef.current = bow;
    applyBowRef.current?.(bow);
  }, [bow]);

  const id = (name: string) => `${uid}${name}`;
  const ref = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      ref={rootRef}
      viewBox="86 28 290 340"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <defs>
        <radialGradient id={id("furBody")} cx=".4" cy=".3" r=".75"><stop offset="0" stopColor="#EFBB7E" /><stop offset=".6" stopColor="#D99A57" /><stop offset="1" stopColor="#A9672F" /></radialGradient>
        <radialGradient id={id("furHead")} cx=".42" cy=".35" r=".7"><stop offset="0" stopColor="#F1C188" /><stop offset=".65" stopColor="#DA9C5A" /><stop offset="1" stopColor="#B07036" /></radialGradient>
        <linearGradient id={id("earFur")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9A5A28" /><stop offset="1" stopColor="#C07E43" /></linearGradient>
        <radialGradient id={id("muzzle")} cx=".5" cy=".35" r=".7"><stop offset="0" stopColor="#FFF1DB" /><stop offset="1" stopColor="#E8C08E" /></radialGradient>
        <radialGradient id={id("nose")} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#5A4438" /><stop offset=".5" stopColor="#1E1712" /><stop offset="1" stopColor="#0A0705" /></radialGradient>
        <filter id={id("soft")} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={id("dust")} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      <ellipse cx="200" cy="352" rx="135" ry="16" fill="#000" opacity=".28" filter={ref("soft")} />

      <g data-part="hit" className={interactive ? "dog-hit" : undefined} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? label : undefined} style={interactive ? undefined : { pointerEvents: "none" }}>
        <g data-part="tail">
          <path d="M282 300 C 330 290, 352 255, 340 220" stroke="#B87437" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M285 298 C 326 288, 346 258, 338 230" stroke="#E2A866" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".6" />
        </g>

        <g data-part="body">
          <ellipse cx="200" cy="290" rx="100" ry="64" fill={ref("furBody")} />
          <ellipse cx="200" cy="306" rx="54" ry="44" fill={ref("muzzle")} />
          <rect x="146" y="298" width="38" height="52" rx="19" fill={ref("furBody")} />
          <ellipse cx="165" cy="346" rx="22" ry="10" fill="#F6DDB6" />
          <path d="M156 346v-6M164 347v-7M174 346v-6" stroke="#C9A27A" strokeWidth="2" strokeLinecap="round" />
          <g data-part="pawR">
            <rect x="216" y="298" width="38" height="52" rx="19" fill={ref("furBody")} />
            <ellipse cx="235" cy="346" rx="22" ry="10" fill="#F6DDB6" />
            <path d="M226 346v-6M234 347v-7M244 346v-6" stroke="#C9A27A" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g stroke="#B07036" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".45">
            <path d="M118 270q6 -6 12 -4" /><path d="M128 300q6 -6 12 -4" /><path d="M262 262q6 -6 12 -2" /><path d="M270 290q6 -6 12 -2" />
          </g>
          {dusty && (
            <>
              <g filter={ref("dust")}>
                <ellipse cx="160" cy="262" rx="30" ry="14" transform="rotate(-12 160 262)" fill="#6B4A2B" opacity=".28" />
                <ellipse cx="236" cy="316" rx="30" ry="12" fill="#6B4A2B" opacity=".24" />
                <ellipse cx="165" cy="336" rx="19" ry="11" fill="#5A4128" opacity=".34" />
                <ellipse cx="235" cy="337" rx="19" ry="10" fill="#5A4128" opacity=".34" />
                <ellipse cx="165" cy="347" rx="23" ry="9" fill="#8A7358" opacity=".5" />
                <ellipse cx="235" cy="347" rx="23" ry="9" fill="#8A7358" opacity=".5" />
              </g>
              <g fill="#4A3520" opacity=".5">
                <circle cx="148" cy="268" r="2.2" /><circle cx="190" cy="274" r="2" /><circle cx="244" cy="300" r="2.4" /><circle cx="172" cy="324" r="2.2" /><circle cx="132" cy="288" r="1.8" />
              </g>
            </>
          )}
          {collar && (
            <g>
              <path d="M146 228 Q200 246 254 228 L254 242 Q200 260 146 242Z" fill="#1F8A70" />
              <circle cx="200" cy="256" r="9" fill="#F2B544" />
              <circle cx="197" cy="253" r="3" fill="#FFE7A0" />
            </g>
          )}
        </g>

        <g data-part="head">
          <g data-part="earL">
            <path d="M150 128 C 122 84, 126 50, 148 40 C 174 56, 180 98, 174 128 Z" fill={ref("earFur")} />
            <path d="M156 116 C 142 86, 144 64, 150 56 C 164 72, 166 96, 164 116 Z" fill="#E9A79A" opacity=".75" />
          </g>
          <g data-part="earR">
            <path d="M250 128 C 278 84, 274 50, 252 40 C 226 56, 220 98, 226 128 Z" fill={ref("earFur")} />
            <path d="M244 116 C 258 86, 256 64, 250 56 C 236 72, 234 96, 236 116 Z" fill="#E9A79A" opacity=".75" />
          </g>
          <circle cx="200" cy="165" r="82" fill={ref("furHead")} />
          <ellipse cx="238" cy="146" rx="30" ry="28" fill="#B9773D" opacity=".75" />
          <g stroke="#B07036" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".5">
            <path d="M170 92q6 -8 14 -6" /><path d="M196 88q6 -8 14 -4" /><path d="M128 150q-2 -8 4 -14" /><path d="M272 150q2 -8 -4 -14" />
          </g>
          {dusty && (
            <g filter={ref("dust")}>
              <ellipse cx="152" cy="116" rx="24" ry="11" transform="rotate(-24 152 116)" fill="#6B4A2B" opacity=".26" />
              <ellipse cx="236" cy="190" rx="17" ry="9" fill="#5A4128" opacity=".22" />
              <ellipse cx="206" cy="102" rx="20" ry="8" fill="#6B4A2B" opacity=".2" />
            </g>
          )}

          <g data-part="eyeL">
            <ellipse data-part="socketL" cx="170" cy="160" rx="17" ry="16" fill="#FFFFFF" stroke="#3A2614" strokeWidth="2.5" />
            <g data-part="pupilL"><circle cx="170" cy="161" r="9" fill="#0A0705" /><circle cx="173.5" cy="156.5" r="3" fill="#fff" /><circle cx="167" cy="165" r="1.3" fill="#fff" opacity=".8" /></g>
          </g>
          <g data-part="eyeR">
            <ellipse data-part="socketR" cx="230" cy="160" rx="17" ry="16" fill="#FFFFFF" stroke="#3A2614" strokeWidth="2.5" />
            <g data-part="pupilR"><circle cx="230" cy="161" r="9" fill="#0A0705" /><circle cx="233.5" cy="156.5" r="3" fill="#fff" /><circle cx="227" cy="165" r="1.3" fill="#fff" opacity=".8" /></g>
          </g>
          <g data-part="closedEyes" opacity="0">
            <path d="M153 162 Q170 176 187 162" stroke="#3A2614" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M213 162 Q230 176 247 162" stroke="#3A2614" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </g>

          <g data-part="sadFace">
            <path d="M150 140 L184 130" stroke="#6B3D1A" strokeWidth="5" strokeLinecap="round" />
            <path d="M250 140 L216 130" stroke="#6B3D1A" strokeWidth="5" strokeLinecap="round" />
            <path data-part="tear" d="M158 180 q-5 9 0 13 q5 -4 0 -13z" fill="#A9D6F2" />
          </g>

          <ellipse cx="200" cy="205" rx="44" ry="31" fill={ref("muzzle")} />
          <path d="M200 196 V214" stroke="#B48A62" strokeWidth="2" />
          <g fill="#9A7350" opacity=".6"><circle cx="178" cy="206" r="1.6" /><circle cx="186" cy="212" r="1.6" /><circle cx="214" cy="206" r="1.6" /><circle cx="222" cy="212" r="1.6" /></g>
          <ellipse cx="200" cy="189" rx="15" ry="11" fill={ref("nose")} />
          <ellipse cx="195" cy="185" rx="4" ry="2.2" fill="#fff" opacity=".45" />

          <g data-part="sadMouth"><path d="M182 224 Q200 213 218 224" stroke="#1E1712" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
          <g data-part="happyFace" opacity="0">
            <path d="M150 134 Q166 124 184 130" stroke="#6B3D1A" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M250 134 Q234 124 216 130" stroke="#6B3D1A" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="146" cy="198" r="12" fill="#EE9A8E" opacity=".45" />
            <circle cx="254" cy="198" r="12" fill="#EE9A8E" opacity=".45" />
          </g>
          <g data-part="happyMouth" opacity="0">
            <path d="M190 220 Q200 252 210 220Z" fill="#E8707A" /><path d="M200 224 V240" stroke="#C4505C" strokeWidth="2" />
            <path d="M178 212 Q200 232 222 212" stroke="#1E1712" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
          <g data-part="barkMouth" opacity="0">
            <path d="M176 210 Q200 204 224 210 Q222 252 200 254 Q178 252 176 210Z" fill="#3A1712" />
            <ellipse cx="200" cy="243" rx="13" ry="8" fill="#E8707A" />
            <path d="M183 210 l3.5 9 l3.5 -9Z M210 210 l3.5 9 l3.5 -9Z" fill="#FFFFFF" />
            <path d="M176 210 Q200 204 224 210" stroke="#1E1712" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>

      <g data-part="zzz" opacity="0" fill="#F2B544" fontFamily="var(--font-heading)" fontWeight="800">
        <text x="292" y="92" fontSize="30">z</text>
        <text x="314" y="62" fontSize="40">Z</text>
      </g>
    </svg>
  );
}
