"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { Brownie, type BrownieMood } from "@/components/brownie/Brownie";
import { playBark, playBoing } from "@/lib/dog-sound";
import type { GuidePose } from "./GuideTitle";

type Stance = { mood: BrownieMood; look: "side" | "front"; pawUp: boolean; bow: boolean };

/** How Brownie stands next to each kind of title. "look: side" means he reads the title first, then turns to you. */
const STANCES: Record<GuidePose, Stance> = {
  point: { mood: "happy", look: "side", pawUp: true, bow: false },
  proud: { mood: "happy", look: "front", pawUp: false, bow: false },
  help: { mood: "happy", look: "side", pawUp: false, bow: false },
  ask: { mood: "happy", look: "side", pawUp: false, bow: false },
  door: { mood: "happy", look: "front", pawUp: true, bow: true },
};

type View = {
  hidden: boolean;
  flying: boolean;
  stance: Stance;
  /** 1: he stands left of the title and the title is on his right. -1: he stands above the title's right end. */
  dir: 1 | -1;
  look: "side" | "front";
  say: string;
};

const START: View = { hidden: true, flying: false, stance: STANCES.proud, dir: 1, look: "front", say: "" };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * One small Brownie who travels down the page. When a section title scrolls into the lower part of the screen
 * he leaps to it, lands beside it, and the title's underline draws itself. Each title says how he should stand
 * (data-guide), and what he says (data-guide-say). He is decorative: hidden from screen readers.
 * With reduced motion he does not leap; he simply appears next to the current title.
 */
function BrownieGuide({ rootRef }: { rootRef: React.RefObject<HTMLDivElement | null> }) {
  const walkerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(START);

  useEffect(() => {
    const root = rootRef.current;
    const walker = walkerRef.current;
    const body = bodyRef.current;
    const layer = layerRef.current;
    if (!root || !walker || !body || !layer) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-guide-ready", "");

    let anchors: HTMLElement[] = [];
    let at: HTMLElement | null = null; // the title he stands at (null: not on the page yet)
    let wanted: HTMLElement | null = null;
    let hop: gsap.core.Tween | null = null;
    let settle: gsap.core.Tween | null = null;
    let glance: gsap.core.Tween | null = null;
    const pos = { x: 0, y: 0 }; // top-left of Brownie, relative to the stage

    const place = () => gsap.set(walker, { x: pos.x, y: pos.y });
    const collect = () => {
      anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-guide]"));
      if (at && !anchors.includes(at)) at = null;
    };

    /** Where he stands for a title. Left of it when there is room, otherwise on top of its right end. */
    const targetFor = (el: HTMLElement) => {
      const r = root.getBoundingClientRect();
      const a = el.getBoundingClientRect();
      const w = walker.offsetWidth;
      const h = body.offsetHeight;
      if (a.left - r.left >= w + 16) {
        return { x: a.left - r.left - w - 10, y: a.top - r.top + Math.min(a.height, h) - h + 4, dir: 1 as const };
      }
      return { x: r.width - w - 12, y: a.top - r.top - h - 4, dir: -1 as const };
    };

    const dust = (x: number, y: number, dir: 1 | -1) => {
      if (reduce) return;
      for (let i = 0; i < 5; i++) {
        const puff = document.createElement("span");
        const size = 7 + Math.random() * 7;
        Object.assign(puff.style, {
          position: "absolute",
          left: `${x + (Math.random() - 0.5) * 36}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "999px",
          background: "#d9b27a",
          opacity: "0",
        });
        puff.style.setProperty("--dx", `${(i - 2) * 9 * dir}px`);
        puff.style.animation = `land-dust 0.7s ease-out ${i * 0.03}s forwards`;
        layer.appendChild(puff);
        setTimeout(() => puff.remove(), 900);
      }
    };

    const land = (el: HTMLElement) => {
      const t = targetFor(el);
      pos.x = t.x;
      pos.y = t.y;
      place();
      gsap.set(body, { rotation: 0 });
      if (!reduce) gsap.fromTo(body, { scaleX: 1.16, scaleY: 0.82 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: "elastic.out(1,.4)", transformOrigin: "50% 100%" });
      dust(t.x + walker.offsetWidth / 2, t.y + body.offsetHeight - 10, t.dir);
      playBoing();

      const stance = STANCES[(el.dataset.guide as GuidePose) ?? "proud"] ?? STANCES.proud;
      setView({ hidden: false, flying: false, stance, dir: t.dir, look: stance.look, say: el.dataset.guideSay ?? "" });
      // he reads the title first, then turns to you
      glance?.kill();
      if (stance.look === "side") glance = gsap.delayedCall(1.5, () => setView((v) => ({ ...v, look: "front" })));
      gsap.delayedCall(0.15, () => el.setAttribute("data-awake", "true"));
    };

    const leave = () => {
      hop?.kill();
      glance?.kill();
      at = null;
      gsap.to(walker, { opacity: 0, duration: 0.25, onComplete: () => setView(START) });
    };

    const goTo = (el: HTMLElement) => {
      hop?.kill();
      glance?.kill();
      const r = root.getBoundingClientRect();
      const viewTop = -r.top;
      const viewBottom = viewTop + innerHeight;
      const fresh = at === null;
      at = el;
      const first = targetFor(el);

      if (reduce) {
        gsap.set(walker, { opacity: 1 });
        land(el);
        return;
      }

      // Start from where he is, but never from far outside the screen: he leaps in from just beyond its edge.
      const sx = fresh ? first.x : pos.x;
      const sy = fresh ? viewTop - 170 : clamp(pos.y, viewTop - 170, viewBottom + 70);
      const dist = Math.hypot(first.x - sx, first.y - sy);
      const arc = Math.min(130, 40 + dist * 0.1);
      const state = { p: 0 };

      gsap.set(walker, { opacity: 1 });
      setView((v) => ({ ...v, hidden: false, flying: true }));
      hop = gsap.to(state, {
        p: 1,
        duration: clamp(0.55 + dist / 2600, 0.6, 1.05),
        ease: "none",
        onUpdate() {
          const p = state.p;
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const t = targetFor(el); // read again every frame: the page may still be moving or re-flowing
          pos.x = sx + (t.x - sx) * e;
          pos.y = sy + (t.y - sy) * e - arc * 4 * p * (1 - p);
          place();
          const lift = Math.sin(p * Math.PI);
          gsap.set(body, { rotation: lift * (t.x >= sx ? 5 : -5), scaleY: 1 + lift * 0.12, scaleX: 1 - lift * 0.06, transformOrigin: "50% 100%" });
        },
        onComplete: () => land(el),
      });
    };

    /** Which title is he for? The last one whose top has passed 68% of the way down the screen. */
    const evaluate = () => {
      ticking = false;
      if (!anchors.length) return;
      const line = innerHeight * 0.68;
      let next: HTMLElement | null = null;
      for (const a of anchors) if (a.getBoundingClientRect().top <= line) next = a;
      if (next === wanted) return;
      wanted = next;
      settle?.kill();
      // wait a moment, so scrolling quickly past several titles ends in one leap to the right one
      settle = gsap.delayedCall(0.14, () => {
        if (wanted === at) return;
        if (wanted) goTo(wanted);
        else if (at) leave();
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };

    /** The page changed shape (resize, fonts, the stats loading in): re-find the titles and keep him in place. */
    let relayout = 0;
    const onRelayout = () => {
      cancelAnimationFrame(relayout);
      relayout = requestAnimationFrame(() => {
        collect();
        if (at && !hop?.isActive()) {
          const t = targetFor(at);
          pos.x = t.x;
          pos.y = t.y;
          place();
          setView((v) => (v.dir === t.dir ? v : { ...v, dir: t.dir }));
        }
        evaluate();
      });
    };

    collect();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onRelayout);
    const resizeObserver = new ResizeObserver(onRelayout);
    resizeObserver.observe(root);
    const mutationObserver = new MutationObserver(onRelayout);
    mutationObserver.observe(root, { childList: true, subtree: true });
    void document.fonts?.ready.then(onRelayout);
    evaluate();

    return () => {
      hop?.kill();
      settle?.kill();
      glance?.kill();
      cancelAnimationFrame(relayout);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onRelayout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      root.removeAttribute("data-guide-ready");
      anchors.forEach((a) => a.removeAttribute("data-awake"));
    };
  }, [rootRef]);

  const { stance, flying, dir, look, hidden, say } = view;

  return (
    <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
      <div ref={walkerRef} className="absolute left-0 top-0 w-16 opacity-0 will-change-transform md:w-24">
        <div ref={bodyRef} className="relative">
          <Brownie
            mood={flying ? "happy" : stance.mood}
            gaze={flying ? "front" : look}
            gazeDir={dir}
            pawUp={!flying && stance.pawUp}
            pawDir={dir}
            bow={!flying && stance.bow}
            interactive
            collar
            label=""
            onBark={() => playBark("woof")}
            className="pointer-events-none block h-auto w-full overflow-visible drop-shadow-[0_6px_8px_rgb(0_0_0/0.18)]"
          />
          {/* what he says; hidden on small screens so it never covers text */}
          <p
            className={`glass absolute top-1 hidden whitespace-nowrap rounded-2xl px-3 py-1.5 text-[13px] font-bold text-foreground transition duration-300 ease-spring sm:block ${
              dir === 1 ? "bottom-full left-0 top-auto mb-9" : "right-full mr-2"
            } ${hidden || flying || !say ? "translate-y-1 scale-90 opacity-0" : "translate-y-0 scale-100 opacity-100"}`}
          >
            {say}
          </p>
        </div>
      </div>
    </div>
  );
}

/** The part of the page Brownie travels through. Put the sections with titles inside it. */
export function GuideStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="relative">
      {children}
      <BrownieGuide rootRef={rootRef} />
    </div>
  );
}
