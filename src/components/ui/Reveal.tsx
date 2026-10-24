"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marks its content when it first scrolls into view, so CSS can play an entrance animation then
 * (elements with the `reveal-tag` class drop in; see globals.css). Without JavaScript, or with
 * reduced motion, nothing is hidden and nothing animates.
 */
export function Reveal({ children, className, threshold = 0.3 }: { children: ReactNode; className?: string; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.setAttribute("data-armed", "");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-in", "");
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
