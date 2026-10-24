"use client";

import { PawPrint } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const COUNT = 22;
const COLORS = ["#e4572e", "#d99a57", "#1f8a70", "#f2b544", "#2e6bd8"];

/** Paw prints burst up and fall. Renders nothing visible with reduced motion. */
export function PawConfetti() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".paw",
        { y: 0, x: 0, scale: 0, opacity: 1, rotation: 0 },
        {
          x: () => gsap.utils.random(-170, 170),
          y: () => gsap.utils.random(-210, -60),
          rotation: () => gsap.utils.random(-200, 200),
          scale: () => gsap.utils.random(0.8, 1.5),
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.015,
          onComplete() {
            gsap.to(".paw", { y: "+=260", opacity: 0, duration: 1.1, ease: "power1.in", stagger: 0.01 });
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
      {Array.from({ length: COUNT }, (_, i) => (
        <PawPrint key={i} className="paw absolute opacity-0" size={26} style={{ color: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  );
}
