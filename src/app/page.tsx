import { Suspense } from "react";
import { GuideStage } from "@/components/home/BrownieGuide";
import { ClosingPanel } from "@/components/home/ClosingPanel";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SponsorsStrip } from "@/components/home/SponsorsStrip";
import { StatsSkeleton, StatsStrip } from "@/components/home/StatsStrip";
import { WaysToHelp } from "@/components/home/WaysToHelp";

// The scroll story lives at /story. Below the hero and the partners strip, a small Brownie hops from
// title to title as you scroll (see BrownieGuide). Every title he visits is marked with <GuideTitle>.
export default function HomePage() {
  return (
    <>
      <Hero />
      <SponsorsStrip />

      <GuideStage>
        <HowItWorks />

        <Suspense fallback={<StatsSkeleton />}>
          <StatsStrip />
        </Suspense>

        <WaysToHelp />
        <Faq />
        <ClosingPanel variant="home" />
      </GuideStage>
    </>
  );
}
