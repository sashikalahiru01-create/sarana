import type { Metadata } from "next";
import { ClosingPanel } from "@/components/home/ClosingPanel";
import { ScrollStory } from "@/components/story/ScrollStory";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.storyTitle") };
}

/** The Brownie scroll story, exactly as it was on the home page. */
export default function StoryPage() {
  return (
    <>
      <ScrollStory />
      <ClosingPanel variant="story" />
    </>
  );
}
