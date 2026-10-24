import { Camera, HandHeart, MapPin, type LucideIcon } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { GuideTitle } from "./GuideTitle";

const steps: { key: "s1" | "s2" | "s3"; icon: LucideIcon; tint: string }[] = [
  { key: "s1", icon: Camera, tint: "bg-coral/12 text-coral-ink dark:text-brownie" },
  { key: "s2", icon: MapPin, tint: "bg-blue/12 text-blue dark:text-[#7ea6f0]" },
  { key: "s3", icon: HandHeart, tint: "bg-green/12 text-green dark:text-[#4fc3a5]" },
];

export async function HowItWorks() {
  const { t } = await getTranslator();

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-20">
      <GuideTitle pose="point" say={t("guide.how")} eyebrow={t("home.how.eyebrow")}>
        {t("home.how.title")}
      </GuideTitle>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map(({ key, icon: Icon, tint }, i) => (
          <li
            key={key}
            className="card group relative overflow-hidden p-6 transition duration-300 ease-spring hover:-translate-y-1 hover:shadow-pop"
          >
            <span aria-hidden="true" className="absolute -right-2 -top-4 font-heading text-[104px] font-extrabold leading-none text-foreground/5">
              {i + 1}
            </span>
            <span className={`relative grid size-12 place-items-center rounded-2xl ${tint}`}>
              <Icon size={24} aria-hidden="true" />
            </span>
            <h3 className="relative mt-5 text-xl">{t(`home.how.${key}.title`)}</h3>
            <p className="relative mt-2 text-muted">{t(`home.how.${key}.body`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
