"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "@/i18n/client";
import { StoryScene } from "./StoryScene";

const steps = ["s1", "s2", "s3", "s4", "s5"] as const;

// Timeline marks (seconds) where each chapter begins; the dots follow them.
const marks = [0, 1.2, 2.9, 4.1, 5.4];

export function ScrollStory() {
  const t = useT();
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NS = "http://www.w3.org/2000/svg";
    const q = <T extends Element = SVGElement>(sel: string) => root.querySelector(sel) as T;
    const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const world = q<SVGSVGElement>("#world");
    const cleanups: Array<() => void> = [];
    let disposed = false;

    // Frame the scene: wide on desktop, closer on phones. The scene stays hidden until framed so phones don't see a jump.
    const frame = () => world.setAttribute("viewBox", innerWidth < 640 ? "250 60 560 480" : "0 0 1000 560");
    frame();
    world.dataset.ready = "true";
    addEventListener("resize", frame);
    cleanups.push(() => removeEventListener("resize", frame));

    const ctx = gsap.context(() => {
      // Rain and puddle splashes
      const rain = q("#rain");
      const splashes = q("#splashes");
      for (let i = 0; i < 60; i++) {
        const line = document.createElementNS(NS, "line");
        const x = Math.random() * 1100 - 50;
        const y = Math.random() * 560 - 60;
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(y));
        line.setAttribute("x2", String(x - 5));
        line.setAttribute("y2", String(y + 16));
        rain.appendChild(line);
        if (!reduce) {
          gsap.to(line, { y: 560, x: -36, duration: 0.6 + Math.random() * 0.5, repeat: -1, ease: "none", delay: -Math.random() });
        }
      }
      for (let i = 0; i < 10; i++) {
        const e = document.createElementNS(NS, "ellipse");
        const cx = i < 6 ? 170 + Math.random() * 260 : 690 + Math.random() * 180;
        const cy = i < 6 ? 484 + Math.random() * 12 : 508 + Math.random() * 10;
        e.setAttribute("cx", String(cx));
        e.setAttribute("cy", String(cy));
        e.setAttribute("rx", "2");
        e.setAttribute("ry", ".6");
        splashes.appendChild(e);
        if (!reduce) {
          gsap.fromTo(e, { attr: { rx: 1, ry: 0.4 }, opacity: 0.9 }, { attr: { rx: 12, ry: 3 }, opacity: 0, duration: 0.8, repeat: -1, delay: Math.random() * 1.5, ease: "power1.out" });
        }
      }
      cleanups.push(() => {
        rain.replaceChildren();
        splashes.replaceChildren();
      });

      // Dog rig: every joint rotates around a fixed point on the body, so parts never drift apart.
      // Ear joint (152,112) sits on the head outline; the head pivots at the neck (200,240); the tail at its root (282,300).
      const pose = { ear: -105, earKick: 0, head: -6, headY: 0, tail: 62, wag: 0, breathe: 1 };
      const earEl = q("#earL");
      const headEl = q("#head");
      const tailEl = q("#tail");
      const bodyEl = q("#body");
      const applyPose = () => {
        const b = pose.breathe;
        const lift = (b - 1) * 122; // how far the chest rises while breathing
        bodyEl.setAttribute("transform", `translate(0 ${350 * (1 - b)}) scale(1 ${b})`);
        headEl.setAttribute("transform", `translate(0 ${pose.headY - lift}) rotate(${pose.head} 200 240)`);
        earEl.setAttribute("transform", `rotate(${pose.ear + pose.earKick} 152 112)`);
        tailEl.setAttribute("transform", `translate(0 ${-(b - 1) * 50}) rotate(${pose.tail + pose.wag} 282 300)`);
      };
      applyPose();
      gsap.ticker.add(applyPose);
      cleanups.push(() => gsap.ticker.remove(applyPose));

      // Starting positions
      gsap.set("#stand", { x: 420 });
      gsap.set("#polaroid", { x: 330, y: 90, scale: 0.15, transformOrigin: "50% 50%" });
      gsap.set("#map", { scale: 0.6, transformOrigin: "50% 50%" });
      gsap.set("#pin", { y: -160 });
      gsap.set("#bowl", { x: -60 });
      gsap.set("#house", { y: 30 });
      gsap.set("#petArm", { transformOrigin: "100% 50%" });
      gsap.set("#toast", { y: -16 });
      gsap.set("#bark", { xPercent: -50 });
      const leash = q<SVGPathElement>("#leash");
      const len = leash.getTotalLength();
      gsap.set(leash, { strokeDasharray: len, strokeDashoffset: len });

      // Ambient life (off with reduced motion)
      if (!reduce) {
        gsap.to(pose, { breathe: 1.022, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        const blink = () => {
          gsap.to(".eye", {
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
        gsap.to("#tear", { y: 22, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.in", repeatDelay: 1.2 });
      }
      const wag = gsap.fromTo(pose, { wag: 0 }, { wag: -40, duration: 0.18, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true });

      // Eyes follow the pointer (or the touch point on phones)
      const movers = (["L", "R"] as const).map((side) => {
        const pupil = q(`#pupil${side}`);
        const socket = q(`#eye${side} .socket`);
        return {
          socket,
          x: gsap.quickTo(pupil, "x", { duration: 0.35, ease: "power3" }),
          y: gsap.quickTo(pupil, "y", { duration: 0.35, ease: "power3" }),
        };
      });
      const look = (cx: number, cy: number) => {
        movers.forEach((m) => {
          const r = m.socket.getBoundingClientRect();
          const ex = r.left + r.width / 2;
          const ey = r.top + r.height / 2;
          const a = Math.atan2(cy - ey, cx - ex);
          const d = Math.min(1, Math.hypot(cx - ex, cy - ey) / 220);
          m.x(Math.cos(a) * 5 * d);
          m.y(Math.sin(a) * 4.5 * d);
        });
      };
      const onPointer = (e: PointerEvent) => look(e.clientX, e.clientY);
      const onTouch = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (touch) look(touch.clientX, touch.clientY);
      };
      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("touchstart", onTouch, { passive: true });
      cleanups.push(() => {
        removeEventListener("pointermove", onPointer);
        removeEventListener("touchstart", onTouch);
      });

      // Hover: the drooped ear tries to perk up. Click or Enter: Brownie barks.
      let happy = false;
      const hit = q("#dogHit");
      const barkBubble = q<HTMLElement>("#bark");
      const mouths = [q("#sadMouth"), q("#happyMouth")];
      const barkMouth = q("#barkMouth");
      const onEnter = () => {
        if (happy) return;
        gsap.killTweensOf(pose, "earKick");
        gsap.timeline().to(pose, { earKick: 60, duration: 0.25, ease: "back.out(3)" }).to(pose, { earKick: 0, duration: 0.7, ease: "elastic.out(1,.4)", delay: 0.25 });
      };
      const bark = () => {
        const s = root.getBoundingClientRect();
        const r = headEl.getBoundingClientRect();
        barkBubble.style.left = r.left + r.width / 2 - s.left + "px";
        barkBubble.style.top = r.top - s.top - 34 + "px";
        gsap.fromTo(barkBubble, { opacity: 0, y: 10, scale: 0.8 }, { opacity: 1, y: -10, scale: 1, duration: 0.25, ease: "back.out(3)" });
        gsap.to(barkBubble, { opacity: 0, y: -30, duration: 0.4, delay: 0.7 });
        // Open the mouth while barking, then put the face back as it was.
        const prev = mouths.map((m) => Number(gsap.getProperty(m, "opacity")));
        gsap.killTweensOf(barkMouth);
        gsap.set(mouths, { opacity: 0 });
        gsap.set(barkMouth, { opacity: 1 });
        gsap.fromTo(pose, { headY: 0 }, { headY: -8, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
        gsap.delayedCall(0.45, () => {
          gsap.set(barkMouth, { opacity: 0 });
          mouths.forEach((m, i) => gsap.set(m, { opacity: prev[i] }));
        });
        if (!happy) {
          gsap.killTweensOf(pose, "earKick");
          gsap.timeline().to(pose, { earKick: 75, duration: 0.2 }).to(pose, { earKick: 0, duration: 0.8, ease: "elastic.out(1,.35)", delay: 0.3 });
        }
      };
      const onKey = (e: Event) => {
        const key = (e as KeyboardEvent).key;
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          bark();
        }
      };
      hit.addEventListener("pointerenter", onEnter);
      hit.addEventListener("click", bark);
      hit.addEventListener("keydown", onKey);
      cleanups.push(() => {
        hit.removeEventListener("pointerenter", onEnter);
        hit.removeEventListener("click", bark);
        hit.removeEventListener("keydown", onKey);
      });

      // The story
      const caps = qa(".story-caption");
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      const swap = (i: number, at: number) => {
        tl.to(caps[i - 1], { autoAlpha: 0, y: -20, duration: 0.35 }, at).fromTo(caps[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.2);
      };

      // 1: people walk past
      tl.to("#passers", { x: -1300, duration: 1.3, ease: "none" }, 0);
      // 2: she stops and takes a photo
      swap(1, 1.2);
      tl.to("#stand", { x: 0, duration: 0.8, ease: "power1.out" }, 1.2)
        .to("#armBack", { opacity: 0, duration: 0.15 }, 2.0)
        .to("#armPhone", { opacity: 1, duration: 0.2 }, 2.0)
        .to("#flash", { opacity: 0.85, duration: 0.05 }, 2.3)
        .to("#flash", { opacity: 0, duration: 0.35 }, 2.35)
        .to("#polaroid", { opacity: 1, x: 0, y: 0, scale: 1, rotation: -6, duration: 0.55, ease: "back.out(1.3)" }, 2.35);
      // 3: the pin lands on the map
      swap(2, 2.9);
      tl.to("#polaroid", { opacity: 0, scale: 0.7, rotation: 0, duration: 0.35 }, 2.9)
        .to("#map", { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" }, 3.0)
        .to("#pin", { y: 0, duration: 0.6, ease: "bounce.out" }, 3.3)
        .fromTo("#ripple", { opacity: 0.9, attr: { r: 8 } }, { opacity: 0, attr: { r: 46 }, duration: 0.6 }, 3.85)
        .to("#toast", { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 3.4);
      // 4: a volunteer comes with food
      swap(3, 4.1);
      tl.to("#skyMorning", { opacity: 1, duration: 1 }, 4.1)
        .to("#nightTint", { opacity: 0, duration: 1 }, 4.1)
        .to("#rain", { opacity: 0, duration: 0.6 }, 4.1)
        .to("#coneShape,#dogRim", { opacity: 0, duration: 0.6 }, 4.1)
        .to("#city", { opacity: 0.5, duration: 0.6 }, 4.1)
        .to("#map", { opacity: 0, y: -40, duration: 0.4 }, 4.1)
        .to("#toast", { opacity: 0, y: -16, duration: 0.3 }, 4.1)
        .to("#stand", { opacity: 0, duration: 0.3 }, 4.25)
        .to("#crouch", { opacity: 1, duration: 0.35 }, 4.3)
        .to("#bowl", { opacity: 1, x: 0, duration: 0.5 }, 4.45)
        .to("#tear", { opacity: 0, duration: 0.2 }, 4.3)
        .to(pose, { ear: -50, duration: 0.8, ease: "back.out(2)" }, 4.6)
        .to(pose, { head: 6, duration: 0.6 }, 4.6)
        .to(pose, { tail: 20, duration: 0.6 }, 4.6)
        .to("#petArm", { rotation: -6, duration: 0.25, repeat: 3, yoyo: true, ease: "sine.inOut" }, 4.7);
      // 5: home
      swap(4, 5.4);
      tl.to("#skyWarm", { opacity: 1, duration: 1 }, 5.4)
        .to("#groundWarm", { opacity: 1, duration: 1 }, 5.4)
        .to("#puddles,#lamp,#street,#city", { opacity: 0, duration: 0.5 }, 5.4)
        .to("#house", { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.4)" }, 5.5)
        .to("#crouch,#bowl", { opacity: 0, duration: 0.3 }, 5.6)
        .to("#home", { opacity: 1, duration: 0.4 }, 5.65)
        .to(leash, { opacity: 1, duration: 0.1 }, 5.8)
        .to(leash, { strokeDashoffset: 0, duration: 0.5 }, 5.8)
        .to(pose, { ear: 0, duration: 0.7, ease: "elastic.out(1,.45)" }, 5.85)
        .to("#sadFace,#sadMouth", { opacity: 0, duration: 0.25 }, 5.85)
        .to("#happyFace,#happyMouth", { opacity: 1, duration: 0.25 }, 5.9)
        .to(pose, { head: 4, duration: 0.5 }, 5.85)
        .to(".heart", { opacity: 1, y: -30, duration: 0.6, stagger: 0.12 }, 6.1)
        .to("#dots", { color: "#182033", duration: 0.3 }, 5.4)
        .to("#hint", { color: "#182033", borderColor: "rgba(24,32,51,.3)", duration: 0.3 }, 5.4)
        .to({}, { duration: 0.7 });

      const total = tl.duration();
      let lastIdx = 0;
      ScrollTrigger.create({
        trigger: root,
        start: "top 64px", // just under the sticky header
        end: "+=550%",
        pin: true,
        scrub: reduce ? true : 0.7,
        animation: tl,
        onUpdate(self) {
          const time = self.progress * total;
          let idx = 0;
          marks.forEach((m, i) => {
            if (time >= m + 0.2) idx = i;
          });
          if (idx !== lastIdx) {
            lastIdx = idx;
            setActive(idx);
          }
          const nowHappy = time > 5.9;
          if (nowHappy !== happy) {
            happy = nowHappy;
            if (happy && !reduce) wag.play();
            else wag.pause();
          }
        },
      });
    }, root);

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative h-(--story-h) min-h-[480px] overflow-hidden bg-night">
      <div className="sky-night absolute inset-0" />
      <div id="skyMorning" className="sky-morning absolute inset-0 opacity-0" />
      <div id="skyWarm" className="sky-warm absolute inset-0 opacity-0" />

      <div
        id="hint"
        className="absolute right-3 top-3 z-[6] flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 text-[13px] font-medium text-white"
      >
        <span className="max-sm:sr-only">{t("story.hint")}</span>
        <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className="animate-[nudge_1.6s_ease-in-out_infinite]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 top-14 z-[2] flex items-end justify-center max-sm:bottom-[220px]">
        <svg
          id="world"
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMax meet"
          role="group"
          aria-label={t("story.alt")}
          className="block size-full opacity-0 transition-opacity duration-300 data-[ready=true]:opacity-100"
        >
          <StoryScene dogLabel={t("story.dogLabel")} />
        </svg>
      </div>

      <div className="story-grain pointer-events-none absolute inset-0 z-[3]" />
      <div className="story-vignette pointer-events-none absolute inset-0 z-[3]" />

      <div
        id="toast"
        role="status"
        className="absolute right-5 top-[72px] z-[5] flex max-w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl bg-white p-3 text-midnight opacity-0 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.5)] max-sm:right-4 max-sm:top-[66px]"
      >
        <div className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#fde6dd] text-coral-ink">
          <MapPin size={20} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="leading-snug">
          <strong className="block text-sm">{t("story.toastTitle")}</strong>
          <small className="text-xs text-[#55607a]">{t("story.toastBody")}</small>
        </div>
      </div>

      <div
        id="bark"
        aria-hidden="true"
        className="pointer-events-none absolute z-[5] rounded-[14px] bg-white px-3.5 py-2 font-heading text-lg font-extrabold text-midnight opacity-0"
      >
        {t("story.bark")}
      </div>

      <div className="absolute bottom-7 left-6 z-[5] w-[min(430px,calc(100%-48px))] max-sm:left-4 max-sm:w-[calc(100%-2rem)]">
        {steps.map((step, i) => (
          <article
            key={step}
            className={`story-caption absolute bottom-0 left-0 flex w-full flex-col gap-2 rounded-card bg-white px-[22px] pb-[22px] pt-5 text-midnight shadow-[0_24px_50px_-24px_rgb(0_0_0/0.6)] ${
              i === 0 ? "" : "invisible opacity-0"
            }`}
          >
            <span className="font-heading text-xs font-bold uppercase tracking-[1.4px] text-coral-ink tabular-nums">
              {t(`story.${step}.kicker`)}
            </span>
            <h2 className="text-[clamp(22px,2.6vw,30px)]">{t(`story.${step}.title`)}</h2>
            <p className="text-[15px] leading-[1.65] text-[#55607a]">{t(`story.${step}.body`)}</p>
          </article>
        ))}
      </div>

      <nav
        id="dots"
        aria-hidden="true"
        className="absolute right-5 top-1/2 z-[5] flex -translate-y-1/2 flex-col gap-3.5 text-white max-sm:hidden"
      >
        {steps.map((step, i) => (
          <div key={step} className="flex items-center justify-end gap-2.5 text-xs font-semibold">
            <span className={`transition duration-300 ${i === active ? "translate-x-0 opacity-90" : "translate-x-1.5 opacity-0"}`}>
              {t(`story.${step}.dot`)}
            </span>
            <b className={`w-2.5 rounded-[5px] bg-current transition-all duration-300 ${i === active ? "h-[26px] opacity-100" : "h-2.5 opacity-35"}`} />
          </div>
        ))}
      </nav>
    </section>
  );
}
