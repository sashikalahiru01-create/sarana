"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type HeroAsk = {
  /** Brownie is looking at you and asking for help: the Report button glows. */
  asking: boolean;
  setAsking: (value: boolean) => void;
  /** The pointer is on the Report button: Brownie looks at you, happy. */
  hovering: boolean;
  setHovering: (value: boolean) => void;
};

const HeroAskContext = createContext<HeroAsk | null>(null);

/** Shares what Brownie is doing with the Report button, so the two can react to each other. */
export function HeroAskProvider({ children }: { children: ReactNode }) {
  const [asking, setAsking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const value = useMemo(() => ({ asking, setAsking, hovering, setHovering }), [asking, hovering]);
  return <HeroAskContext.Provider value={value}>{children}</HeroAskContext.Provider>;
}

export function useHeroAsk() {
  const value = useContext(HeroAskContext);
  if (!value) throw new Error("useHeroAsk must be used inside <HeroAskProvider>");
  return value;
}

/** The hero's Report button. It glows while Brownie asks for help, and Brownie cheers up when you point at it. */
export function ReportButton({ label }: { label: string }) {
  const { asking, setHovering } = useHeroAsk();

  return (
    <Link
      href="/report"
      className="btn btn-primary !min-h-14 !px-7 text-lg"
      style={asking ? { animation: "ask-glow 1.3s ease-out infinite" } : undefined}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <Camera size={22} aria-hidden="true" />
      {label}
    </Link>
  );
}
