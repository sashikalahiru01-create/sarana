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

/** How he looks for a moment on his window seat, just before he takes off: still the sad Brownie from the hero. */
const SEAT_STANCE: Stance = { mood: "thinking", look: "front", pawUp: false, bow: false };

/** left: he stands left of the title. right: he stands right of it. top: he sits on top of its right end (narrow screens). */
type Mode = "left" | "right" | "top";

type View = {
  hidden: boolean;
  flying: boolean;
  stance: Stance;
  /** 1: the title is on his right (he faces right). -1: the title is on his left. */
  dir: 1 | -1;
  mode: Mode;
  look: "side" | "front";
  say: string;
};

const START: View = { hidden: true, flying: false, stance: STANCES.proud, dir: 1, mode: "left", look: "front", say: "" };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** A place he can stand: top-left corner (relative to the stage), which way he faces, and his size (1 = guide size). */
type Spot = { x: number; y: number; dir: 1 | -1; mode: Mode; scale: number };

/**
 * One Brownie who travels down the page. He starts as the big Brownie on the hero's window seat; when you scroll
 * he crouches, takes off, shrinks in the air and lands next to the first title. After that he leaps to each section
 * title as it scrolls into view, and the title's underline draws itself. Scroll back up and he leaps home to his seat.
 * He is decorative (hidden from screen readers). With reduced motion he does not leap: he just appears next to the
 * current title, and the hero Brownie hides.
 */
function BrownieGuide({ rootRef, followText }: { rootRef: React.RefObject<HTMLDivElement | null>; followText: string }) {
  const walkerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(followText);
  const [view, setView] = useState<View>(START);

  useEffect(() => {
    followRef.current = followText;
  }, [followText]);

  useEffect(() => {
    const root = rootRef.current;
    const walker = walkerRef.current;
    const body = bodyRef.current;
    const layer = layerRef.current;
    if (!root || !walker || !body || !layer) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-guide-ready", "");

    let anchors: HTMLElement[] = [];
    let hero: HTMLElement | null = null; // the big Brownie on the hero's window seat
    let at: HTMLElement | null = null; // where he is: a title, or the hero seat (hero) when he is home
    let wanted: HTMLElement | null = null;
    let hop: gsap.core.Animation | null = null;
    let settle: gsap.core.Tween | null = null;
    let glance: gsap.core.Tween | null = null;
    let justLeftHome = false; // the first landing after leaving the seat says "Follow me!"
    const pos = { x: 0, y: 0, scale: 1 };

    const place = () => gsap.set(walker, { x: pos.x, y: pos.y, scale: pos.scale, transformOrigin: "0 0" });

    const collect = () => {
      anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-guide]"));
      hero = root.querySelector<HTMLElement>("[data-hero-brownie]");
      if (!at || (at !== hero && !anchors.includes(at))) at = hero;
    };

    /** Where he stands for a place on the page. Left of a title when there is room, otherwise on top of its right end. */
    const spotFor = (el: HTMLElement): Spot => {
      const r = root.getBoundingClientRect();
      const a = el.getBoundingClientRect();
      const w = walker.offsetWidth;
      const h = body.offsetHeight;
      if (el === hero) return { x: a.left - r.left, y: a.top - r.top, dir: 1, mode: "left", scale: a.width / w };
      const roomLeft = a.left - r.left >= w + 16;
      const roomRight = r.right - a.right >= w + 24;
      const preferLeft = anchors.indexOf(el) % 2 === 0;
      const mode: Mode = preferLeft ? (roomLeft ? "left" : roomRight ? "right" : "top") : roomRight ? "right" : roomLeft ? "left" : "top";
      const bottomY = a.top - r.top + Math.min(a.height, h) - h + 4;
      if (mode === "left") return { x: a.left - r.left - w - 10, y: bottomY, dir: 1, mode, scale: 1 };
      if (mode === "right") return { x: a.right - r.left + 10, y: bottomY, dir: -1, mode, scale: 1 };
      return { x: r.width - w - 12, y: a.top - r.top - h - 4, dir: -1, mode, scale: 1 };
    };

    const heroVisible = () => {
      if (!hero) return false;
      const a = hero.getBoundingClientRect();
      return a.bottom > 60 && a.top < innerHeight - 40;
    };

    const dust = (x: number, y: number, dir: 1 | -1, spread = 36) => {
      if (reduce) return;
      for (let i = 0; i < 5; i++) {
        const puff = document.createElement("span");
        const size = 7 + Math.random() * 7;
        Object.assign(puff.style, {
          position: "absolute",
          left: `${x + (Math.random() - 0.5) * spread}px`,
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
      const t = spotFor(el);
      pos.x = t.x;
      pos.y = t.y;
      pos.scale = t.scale;
      place();
      gsap.set(body, { rotation: 0 });
      if (!reduce) gsap.fromTo(body, { scaleX: 1.16, scaleY: 0.82 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: "elastic.out(1,.4)", transformOrigin: "50% 100%" });

      if (el === hero) {
        // Home again: the big Brownie is back on his seat and the guide steps out of sight.
        hero.removeAttribute("data-away");
        gsap.set(walker, { opacity: 0 });
        gsap.set(body, { scaleX: 1, scaleY: 1, rotation: 0 });
        setView(START);
        playBoing();
        return;
      }

      dust(t.x + walker.offsetWidth / 2, t.y + body.offsetHeight - 10, t.dir);
      playBoing();
      const stance = STANCES[(el.dataset.guide as GuidePose) ?? "proud"] ?? STANCES.proud;
      const say = justLeftHome ? followRef.current : (el.dataset.guideSay ?? "");
      justLeftHome = false;
      setView({ hidden: false, flying: false, stance, dir: t.dir, mode: t.mode, look: stance.look, say });
      // he reads the title first, then turns to you
      glance?.kill();
      if (stance.look === "side") glance = gsap.delayedCall(1.5, () => setView((v) => ({ ...v, look: "front" })));
      gsap.delayedCall(0.15, () => el.setAttribute("data-awake", "true"));
    };

    /** The leap itself: from a starting spot to wherever `el` is, re-reading the target every frame. */
    const fly = (el: HTMLElement, from: { x: number; y: number; scale: number }) => {
      const first = spotFor(el);
      const dist = Math.hypot(first.x - from.x, first.y - from.y);
      const arc = Math.min(170, 50 + dist * 0.12);
      const state = { p: 0 };

      gsap.set(walker, { opacity: 1 });
      setView((v) => ({ ...v, hidden: false, flying: true }));
      hop = gsap.to(state, {
        p: 1,
        duration: clamp(0.6 + dist / 2400, 0.65, 1.15),
        ease: "none",
        onUpdate() {
          const p = state.p;
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const t = spotFor(el); // read again every frame: the page may still be moving or re-flowing
          pos.x = from.x + (t.x - from.x) * e;
          pos.y = from.y + (t.y - from.y) * e - arc * 4 * p * (1 - p);
          pos.scale = from.scale + (t.scale - from.scale) * e;
          place();
          const lift = Math.sin(p * Math.PI);
          gsap.set(body, { rotation: lift * (t.x >= from.x ? 6 : -6), scaleY: 1 + lift * 0.12, scaleX: 1 - lift * 0.06, transformOrigin: "50% 100%" });
        },
        onComplete: () => land(el),
      });
    };

    const goTo = (el: HTMLElement) => {
      hop?.kill();
      glance?.kill();
      const prev = at;
      at = el;
      const r = root.getBoundingClientRect();
      const viewTop = -r.top;
      const viewBottom = viewTop + innerHeight;
      const t = spotFor(el);

      if (reduce) {
        if (el === hero) {
          hero?.removeAttribute("data-away");
          gsap.set(walker, { opacity: 0 });
          setView(START);
        } else {
          hero?.setAttribute("data-away", "true");
          gsap.set(walker, { opacity: 1 });
          land(el);
        }
        return;
      }

      if (el !== hero && prev === hero && hero) {
        hero.setAttribute("data-away", "true");
        justLeftHome = true;
        if (heroVisible()) {
          // The big Brownie himself takes off: the guide appears exactly over him, at his size, and crouches.
          const seat = spotFor(hero);
          pos.x = seat.x;
          pos.y = seat.y;
          pos.scale = seat.scale;
          place();
          gsap.set(walker, { opacity: 1 });
          setView({ hidden: false, flying: false, stance: SEAT_STANCE, dir: 1, mode: "left", look: "front", say: "" });
          playBark("yip", 1.2);
          gsap.fromTo(body, { scaleX: 1, scaleY: 1 }, { scaleX: 1.1, scaleY: 0.8, duration: 0.22, ease: "power2.in", transformOrigin: "50% 100%" });
          hop = gsap.delayedCall(0.24, () => {
            dust(seat.x + (walker.offsetWidth * seat.scale) / 2, seat.y + body.offsetHeight * seat.scale - 12, 1, 90);
            fly(el, { x: seat.x, y: seat.y, scale: seat.scale });
          });
        } else {
          // the hero is out of sight (the page was opened further down): he simply leaps in from above the screen
          fly(el, { x: t.x, y: viewTop - 170, scale: 1 });
        }
        return;
      }

      // from one title to another, or from a title back to the seat
      fly(el, { x: pos.x, y: clamp(pos.y, viewTop - 170, viewBottom + 70), scale: pos.scale });
    };

    /** Which place is he for? The last title whose top has passed its line, or his seat if none has. */
    const evaluate = () => {
      ticking = false;
      if (!anchors.length) return;
      let next: HTMLElement | null = null;
      anchors.forEach((a, i) => {
        // the first title counts as soon as it is nearly on screen, so he takes off with the first scroll
        if (a.getBoundingClientRect().top <= innerHeight * (i === 0 ? 0.92 : 0.68)) next = a;
      });
      const target: HTMLElement | null = next ?? hero;
      if (target === wanted) return;
      wanted = target;
      settle?.kill();
      // wait a moment, so scrolling quickly past several titles ends in one leap to the right one
      settle = gsap.delayedCall(0.14, () => {
        if (wanted && wanted !== at) goTo(wanted);
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
        if (at && at !== hero && !hop?.isActive()) {
          const t = spotFor(at);
          pos.x = t.x;
          pos.y = t.y;
          place();
          setView((v) => (v.dir === t.dir && v.mode === t.mode ? v : { ...v, dir: t.dir, mode: t.mode }));
        }
        evaluate();
      });
    };

    collect();
    at = hero;
    wanted = hero;
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
      hero?.removeAttribute("data-away");
      anchors.forEach((a) => a.removeAttribute("data-awake"));
    };
  }, [rootRef]);

  const { stance, flying, dir, mode, look, hidden, say } = view;

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
              mode === "top" ? "right-full mr-2" : "bottom-full left-0 top-auto mb-9"
            } ${hidden || flying || !say ? "translate-y-1 scale-90 opacity-0" : "translate-y-0 scale-100 opacity-100"}`}
          >
            {say}
          </p>
        </div>
      </div>
    </div>
  );
}

/** The part of the page Brownie travels through: the hero (his seat) and every section with a title he visits. */
export function GuideStage({ children, followText }: { children: ReactNode; followText: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="relative">
      {children}
      <BrownieGuide rootRef={rootRef} followText={followText} />
    </div>
  );
}
