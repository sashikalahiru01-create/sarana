import type { ReactNode } from "react";

export type GuidePose = "point" | "proud" | "help" | "ask" | "door";

/**
 * A section title that Brownie visits. The data attributes tell the guide where to land, how to stand
 * and what to say; the wavy underline draws itself when he arrives (see globals.css).
 */
export function GuideTitle({
  pose,
  say,
  eyebrow,
  children,
  className = "text-[clamp(28px,4.4vw,46px)]",
  underline = "text-coral",
}: {
  pose: GuidePose;
  say: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  underline?: string;
}) {
  return (
    <>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 data-guide={pose} data-guide-say={say} className={`relative mt-3 inline-block max-w-[22ch] ${className}`}>
        {children}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className={`guide-underline absolute -bottom-2 left-0 h-[0.26em] w-full overflow-visible ${underline}`}
        >
          <path d="M2 8 Q 14 1 26 7 T 50 7 T 74 7 T 98 6" pathLength={100} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </h2>
    </>
  );
}
