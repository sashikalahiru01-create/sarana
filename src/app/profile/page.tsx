import { HandHeart, PawPrint, Shield } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { PetList } from "@/components/profile/PetList";
import { VolunteerSettings } from "@/components/profile/VolunteerSettings";
import { getTranslator } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getProfileData } from "@/lib/profile-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: `${t("profile.title")} – ${t("common.appName")}` };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/join?next=%2Fprofile");

  const [{ t }, data] = await Promise.all([getTranslator(), getProfileData(user.id)]);
  const name = data.displayName ?? user.name ?? data.volunteer?.name ?? null;
  const shown = name ?? user.email ?? "";
  const initial = shown.trim().charAt(0).toUpperCase() || "?";

  const badges = [
    data.isAdmin && { icon: Shield, text: t("profile.badge.admin"), tone: "bg-blue/12 text-blue dark:text-[#7ea6f0]" },
    data.volunteer && { icon: HandHeart, text: t("profile.badge.volunteer"), tone: "bg-green/12 text-green dark:text-[#4fc3a5]" },
    { icon: PawPrint, text: t("profile.badge.member"), tone: "bg-gold/25 text-[#8a5b00] dark:text-gold" },
  ].filter(Boolean) as { icon: typeof PawPrint; text: string; tone: string }[];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-28 pt-6 lg:pb-12 lg:pt-8">
      {/* who you are */}
      <header className="card flex flex-col gap-5 overflow-hidden bg-linear-to-br from-cream/70 to-surface p-5 sm:flex-row sm:items-center sm:p-6 dark:from-surface dark:to-surface">
        <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-[#f47a50] to-coral font-heading text-4xl font-extrabold text-white shadow-coral">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a small profile picture from Google
            <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-[clamp(26px,5vw,36px)] leading-tight [overflow-wrap:anywhere]">{name ?? t("profile.title")}</h1>
          {user.email && <p className="text-muted [overflow-wrap:anywhere]">{user.email}</p>}
          <ul className="flex flex-wrap gap-2">
            {badges.map(({ icon: Icon, text, tone }) => (
              <li key={text} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${tone}`}>
                <Icon size={14} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:w-64">
          {[
            [data.reports.length, t("profile.stats.reports")],
            [data.helped.length, t("profile.stats.helped")],
          ].map(([n, label]) => (
            <div key={String(label)} className="rounded-2xl bg-surface/80 px-4 py-3 text-center ring-1 ring-line/60">
              <dd className="order-first font-heading text-3xl font-extrabold tabular-nums">{n}</dd>
              <dt className="text-xs font-bold text-muted">{label}</dt>
            </div>
          ))}
        </dl>
      </header>

      {/* settings on the left, what you have done on the right */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <VolunteerSettings userId={user.id} volunteer={data.volunteer} />
          <AccountSettings userId={user.id} email={user.email} displayName={data.displayName} />
        </div>
        <div className="flex flex-col gap-5">
          <PetList
            title={t("profile.reports.title")}
            empty={t("profile.reports.empty")}
            emptyCta={t("profile.reports.emptyCta")}
            emptyHref="/report"
            items={data.reports.map((pet) => ({ pet }))}
          />
          <PetList
            title={t("profile.helped.title")}
            empty={t("profile.helped.empty")}
            emptyCta={t("profile.helped.emptyCta")}
            emptyHref="/map"
            items={data.helped.map(({ pet, role }) => ({ pet, role }))}
          />
        </div>
      </div>
    </div>
  );
}
