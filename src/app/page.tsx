import { Suspense } from "react";
import { ClosingPanel } from "@/components/home/ClosingPanel";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StatsSkeleton, StatsStrip } from "@/components/home/StatsStrip";

// The scroll story lives at /story. The home page is built section by section; the hero comes first.
export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />

      <Suspense fallback={<StatsSkeleton />}>
        <StatsStrip />
      </Suspense>

      <ClosingPanel variant="home" />
    </>
  );
}
