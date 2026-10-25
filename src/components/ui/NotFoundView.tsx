import { Home, Map as MapIcon, PawPrint } from "lucide-react";
import Link from "next/link";
import { Brownie } from "@/components/brownie/Brownie";
import { getTranslator } from "@/i18n/server";

/** Brownie sniffing along the ground, looking for the page. A trail of paw prints leads the way. */
export async function NotFoundView({ pet = false }: { pet?: boolean }) {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <div className="relative w-56 sm:w-64">
        <div className="animate-[sniff_3.2s_ease-in-out_infinite]">
          <Brownie mood="thinking" gaze="down" collar label="" className="block h-auto w-full overflow-visible" />
        </div>
        <span aria-hidden="true" className="mx-auto mt-1 block h-3 w-4/5 rounded-[50%] bg-black/10 blur-[2px] dark:bg-black/30" />
      </div>

      {/* paw prints that appear one after another */}
      <div aria-hidden="true" className="flex items-end gap-5 text-brownie">
        {[0, 1, 2, 3, 4].map((i) => (
          <PawPrint key={i} size={20} className="animate-[paw-fade_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.45}s`, transform: `translateY(${i % 2 ? 6 : -6}px) rotate(${i % 2 ? 14 : -14}deg)` }} />
        ))}
      </div>

      <p className="eyebrow">404</p>
      <h1 className="text-[clamp(26px,6vw,36px)] leading-tight">{t(pet ? "notFound.petTitle" : "notFound.title")}</h1>
      <p className="text-muted">{t(pet ? "notFound.petBody" : "notFound.body")}</p>

      <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link href="/map" className="btn btn-primary">
          <MapIcon size={18} aria-hidden="true" />
          {t("notFound.map")}
        </Link>
        <Link href="/" className="btn btn-ghost">
          <Home size={18} aria-hidden="true" />
          {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
}
