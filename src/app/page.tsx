import { Camera } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/i18n/server";

// Placeholder home page: it only proves the tokens, fonts and translations work.
// Step 2 replaces it with the Brownie scroll story.
const statuses = [
  { key: "status.reported", className: "bg-coral" },
  { key: "status.help_on_the_way", className: "bg-blue" },
  { key: "status.safe", className: "bg-green" },
  { key: "status.adopted", className: "bg-gold !text-midnight" },
] as const;

export default async function HomePage() {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-16">
      <h1 className="text-4xl sm:text-5xl">{t("home.title")}</h1>
      <p className="max-w-[60ch] text-lg text-muted">{t("home.subtitle")}</p>

      <Link href="/report" className="btn btn-primary">
        <Camera size={20} aria-hidden="true" />
        {t("home.reportCta")}
      </Link>

      <ul className="flex flex-wrap gap-2">
        {statuses.map(({ key, className }) => (
          <li key={key} className={`chip ${className}`}>
            {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
