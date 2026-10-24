import { PawPrint } from "lucide-react";

const PAWS = 8;

/** Progress bar where paw prints walk along as the value grows. value is 0 to 1. */
export function PawProgress({ value, label }: { value: number; label: string }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={label}>
      <div className="relative h-10">
        {Array.from({ length: PAWS }, (_, i) => {
          const shown = value >= (i + 0.5) / PAWS;
          return (
            <PawPrint
              key={i}
              aria-hidden="true"
              size={22}
              className={`absolute text-brownie transition duration-300 ease-spring ${shown ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
              style={{
                left: `calc(${(i / PAWS) * 100}% + 2px)`,
                top: i % 2 === 0 ? 2 : 14, // left and right feet alternate
                rotate: "90deg",
              }}
            />
          );
        })}
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-coral transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
