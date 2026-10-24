import type { LucideIcon } from "lucide-react";

/**
 * A small glass card that floats over the edge of the hero picture. It pops in, then bobs gently.
 * `position` places it (use negative offsets to push it outside the picture).
 */
export function FloatingCard({
  icon: Icon,
  tint,
  step,
  title,
  body,
  position,
  delay,
  bob,
}: {
  icon: LucideIcon;
  tint: string;
  step: number;
  title: string;
  body: string;
  position: string;
  delay: number;
  bob: number;
}) {
  return (
    <div
      data-step={step}
      className={`hero-card absolute z-10 max-w-[16rem] ${position} animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_backwards]`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="glass flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4 shadow-pop"
        style={{ animation: `bob ${bob}s ease-in-out ${delay}s infinite` }}
      >
        <span className={`relative grid size-10 shrink-0 place-items-center rounded-xl ${tint}`}>
          <Icon size={20} aria-hidden="true" />
          <span className="absolute -right-1.5 -top-1.5 grid size-[18px] place-items-center rounded-full bg-midnight text-[10px] font-extrabold text-white ring-2 ring-background">
            {step}
          </span>
        </span>
        <span className="leading-tight">
          <strong className="block text-[13px] font-bold text-foreground sm:text-sm">{title}</strong>
          <small className="text-[11px] font-medium text-muted sm:text-xs">{body}</small>
        </span>
      </div>
    </div>
  );
}
