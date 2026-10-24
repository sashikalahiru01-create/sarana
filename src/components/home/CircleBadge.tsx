import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A round sticker with text running around it in a circle. The ring of words turns slowly
 * (faster when you point at it) and the sticker leads to the report page.
 */
export function CircleBadge({ text, label, className = "" }: { text: string; label: string; className?: string }) {
  return (
    <Link
      href="/report"
      aria-label={label}
      className={`group grid size-[92px] place-items-center rounded-full bg-midnight text-cream shadow-pop ring-4 ring-background transition duration-300 ease-spring hover:scale-110 sm:size-[110px] ${className}`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 animate-[spin-slow_20s_linear_infinite] group-hover:[animation-duration:6s]">
        <defs>
          <path id="circle-badge-path" d={`M60 60 m-${RADIUS} 0 a${RADIUS} ${RADIUS} 0 1 1 ${RADIUS * 2} 0 a${RADIUS} ${RADIUS} 0 1 1 -${RADIUS * 2} 0`} />
        </defs>
        <text fill="currentColor" fontSize="11" fontWeight="700" fontFamily="var(--font-heading)">
          <textPath href="#circle-badge-path" textLength={CIRCUMFERENCE - 4} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="relative grid size-11 place-items-center rounded-full bg-linear-to-br from-[#f47a50] to-coral text-white transition duration-300 group-hover:rotate-45 sm:size-[52px]">
        <ArrowUpRight size={24} aria-hidden="true" />
      </span>
    </Link>
  );
}
