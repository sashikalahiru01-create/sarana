import { Heart, ShieldCheck, Timer } from "lucide-react";
import type { Metadata } from "next";
import { Brownie } from "@/components/brownie/Brownie";
import { VolunteerForm } from "@/components/volunteer/VolunteerForm";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: `${t("volunteer.title")} – ${t("common.appName")}` };
}

export default async function VolunteerPage() {
  const { t } = await getTranslator();
  const perks = [
    { icon: Heart, text: t("volunteer.perks.free") },
    { icon: ShieldCheck, text: t("volunteer.perks.near") },
    { icon: Timer, text: t("volunteer.perks.stop") },
  ];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
      <header className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="glass inline-flex w-fit items-center gap-2 rounded-full py-1.5 pl-3 pr-4 text-[13px] font-bold text-coral-ink dark:text-brownie">
            <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
              <span className="absolute size-2.5 animate-ping rounded-full bg-coral/50" />
              <span className="size-2.5 rounded-full bg-coral" />
            </span>
            {t("volunteer.eyebrow")}
          </p>
          <h1 className="text-[clamp(30px,6vw,44px)] leading-[1.15] tracking-[-0.02em]">{t("volunteer.title")}</h1>
        </div>
        <div className="w-24 shrink-0 animate-[pop-in_0.7s_cubic-bezier(0.34,1.4,0.64,1)_0.2s_backwards] sm:w-28">
          <Brownie mood="happy" collar label="" />
        </div>
      </header>

      <p className="text-muted">{t("volunteer.subtitle")}</p>

      <ul className="flex flex-wrap gap-2 text-sm font-semibold">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Icon size={15} className="text-green" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>

      <VolunteerForm />
    </div>
  );
}
