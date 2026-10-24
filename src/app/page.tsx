import { Suspense } from "react";
import { ClosingPanel } from "@/components/home/ClosingPanel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StatsSkeleton, StatsStrip } from "@/components/home/StatsStrip";

// Interim home page: the scroll story now lives at /story. The new dog-themed home is built next.
export default function HomePage() {
  return (
    <>
      <HowItWorks />

      <Suspense fallback={<StatsSkeleton />}>
        <StatsStrip />
      </Suspense>

      <ClosingPanel variant="home" />
    </>
  );
}
