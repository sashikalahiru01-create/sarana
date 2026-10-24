import { Bone, Car, Heart, House, Stethoscope, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { GuideTitle } from "./GuideTitle";
import { ShareTile } from "./ShareTile";

const tiles: { key: "feed" | "transport" | "foster" | "vet" | "adopt"; icon: LucideIcon; href: string; tint: string }[] = [
  { key: "feed", icon: Bone, href: "/volunteer", tint: "bg-coral/12 text-coral-ink dark:text-brownie" },
  { key: "transport", icon: Car, href: "/volunteer", tint: "bg-blue/12 text-blue dark:text-[#7ea6f0]" },
  { key: "foster", icon: House, href: "/volunteer", tint: "bg-green/12 text-green dark:text-[#4fc3a5]" },
  { key: "vet", icon: Stethoscope, href: "/volunteer", tint: "bg-gold/20 text-[#8a5b00] dark:text-gold" },
  { key: "adopt", icon: Heart, href: "/map", tint: "bg-coral/12 text-coral-ink dark:text-brownie" },
];

export async function WaysToHelp() {
  const { t } = await getTranslator();
  const card =
    "card group flex flex-col gap-3 p-5 transition duration-300 ease-spring hover:-translate-y-1 hover:shadow-pop focus-visible:-translate-y-1";

  return (
    <section className="mx-auto max-w-5xl px-4 pt-24">
      <GuideTitle pose="help" say={t("guide.help")} eyebrow={t("ways.eyebrow")}>
        {t("ways.title")}
      </GuideTitle>

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ key, icon: Icon, href, tint }) => (
          <li key={key} className="flex">
            <Link href={href} className={`${card} w-full`}>
              <span className={`grid size-12 place-items-center rounded-2xl transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${tint}`}>
                <Icon size={24} aria-hidden="true" />
              </span>
              <strong className="font-heading text-lg">{t(`ways.${key}.title`)}</strong>
              <span className="text-muted">{t(`ways.${key}.body`)}</span>
            </Link>
          </li>
        ))}
        <li className="flex">
          <ShareTile className={`${card} w-full text-left`} title={t("ways.share.title")} body={t("ways.share.body")} text={t("ways.share.text")} />
        </li>
      </ul>
    </section>
  );
}
