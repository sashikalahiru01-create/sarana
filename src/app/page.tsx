import { Camera } from "lucide-react";
import Link from "next/link";
import { ReplayButton } from "@/components/story/ReplayButton";
import { ScrollStory } from "@/components/story/ScrollStory";
import { getTranslator } from "@/i18n/server";

export default async function HomePage() {
  const { t } = await getTranslator();

  return (
    <>
      <ScrollStory />

      <section className="bg-cream px-4 pb-[72px] pt-24 text-midnight dark:bg-midnight dark:text-cream">
        <div className="mx-auto flex max-w-[900px] flex-col items-start gap-5">
          <h2 className="text-[clamp(30px,4.6vw,54px)] tracking-[-0.8px]">{t("home.title")}</h2>
          <p className="max-w-[60ch] text-[17px] leading-[1.7] text-[#5b5346] dark:text-cream/75">{t("home.subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/report" className="btn btn-primary !min-h-14">
              <Camera size={20} aria-hidden="true" />
              {t("home.reportCta")}
            </Link>
            <ReplayButton />
          </div>
        </div>
      </section>
    </>
  );
}
