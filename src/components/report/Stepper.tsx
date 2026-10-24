import { Check } from "lucide-react";

/** Three-step indicator. `current` is 0-based. */
export function Stepper({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return (
    <ol aria-label={label} className="flex items-center gap-2">
      {steps.map((name, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={name} aria-current={active ? "step" : undefined} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition duration-300 ${
                done ? "bg-green text-white" : active ? "bg-coral text-white" : "bg-line text-muted"
              }`}
            >
              {done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <span className={`truncate text-sm font-semibold ${active ? "text-foreground" : "text-muted"}`}>{name}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="h-0.5 min-w-3 flex-1 rounded bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
