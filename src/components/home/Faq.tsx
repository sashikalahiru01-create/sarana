import { Plus } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { GuideTitle } from "./GuideTitle";

const questions = ["q1", "q2", "q3", "q4", "q5"] as const;

/** Questions people ask before they report. Plain <details> elements: they work without JavaScript and by keyboard. */
export async function Faq() {
  const { t } = await getTranslator();

  return (
    <section className="mx-auto max-w-3xl px-4 pt-24">
      <GuideTitle pose="ask" say={t("guide.faq")} eyebrow={t("faq.eyebrow")}>
        {t("faq.title")}
      </GuideTitle>

      <div className="mt-10 flex flex-col gap-3">
        {questions.map((key, i) => (
          <details key={key} className="card group overflow-hidden" open={i === 0}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-heading text-lg font-bold [&::-webkit-details-marker]:hidden">
              {t(`faq.${key}.q`)}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coral/12 text-coral-ink transition duration-300 group-open:rotate-45 dark:text-brownie">
                <Plus size={18} aria-hidden="true" />
              </span>
            </summary>
            <p className="faq-body px-5 pb-5 leading-[1.7] text-muted">{t(`faq.${key}.a`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
