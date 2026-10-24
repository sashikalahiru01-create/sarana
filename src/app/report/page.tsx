import type { Metadata } from "next";
import { ReportForm } from "@/components/report/ReportForm";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: `${t("report.title")} – ${t("common.appName")}` };
}

export default async function ReportPage() {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl">{t("report.title")}</h1>
        <p className="text-muted">{t("report.subtitle")}</p>
      </header>
      <ReportForm />
    </div>
  );
}
