import { ArrowLeft, Cat, Dog, MapPin, Quote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpPanel } from "@/components/pet/HelpPanel";
import { PetGallery } from "@/components/pet/PetGallery";
import { PetLocation } from "@/components/pet/PetLocation";
import { ShareBar } from "@/components/pet/ShareBar";
import { StatusJourney } from "@/components/pet/StatusJourney";
import { Timeline } from "@/components/pet/Timeline";
import { getTranslator } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { canSetStatus, getPet, getTimeline } from "@/lib/pet-detail";
import { agoLabel } from "@/lib/pet-text";
import { statusColor } from "@/lib/pets";
import { photoUrl } from "@/lib/reports";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const pet = await getPet(id);
  const { t } = await getTranslator();
  if (!pet) return { title: `${t("notFound.petTitle")} – ${t("common.appName")}` };

  const title = `${t(`report.details.${pet.animal_type}`)} · ${t(`status.${pet.status}`)} – ${t("common.appName")}`;
  const description = pet.note ?? pet.location_label ?? t("pet.share.text", { type: t(`report.details.${pet.animal_type}`) });
  // a photo makes the WhatsApp and Facebook preview worth tapping
  const images = pet.photo_paths[0] ? [photoUrl(pet.photo_paths[0])] : undefined;
  return { title, description, openGraph: { title, description, images } };
}

export default async function PetPage({ params }: Params) {
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet) notFound();

  const user = await getCurrentUser();
  const [{ t }, timeline, mayChangeStatus] = await Promise.all([getTranslator(), getTimeline(id), user ? canSetStatus(user.id) : false]);

  const kind = t(`report.details.${pet.animal_type}`);
  const Icon = pet.animal_type === "dog" ? Dog : Cat;
  const color = statusColor[pet.status];
  const urgent = pet.is_urgent && pet.status !== "adopted";
  const offers = timeline.filter((e) => e.kind === "offer_help").length;
  const homes = timeline.filter((e) => e.kind === "offer_home").length;
  const conditions = pet.conditions.filter((c): c is "injured" | "sick" | "hungry" | "young" | "needs_home" | "friendly" =>
    ["injured", "sick", "hungry", "young", "needs_home", "friendly"].includes(c),
  );

  // On a phone everything is one column in reading order; on a laptop the page splits into a left and a right column.
  // `contents` lets the sections of both columns be ordered together on the phone.
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 lg:pb-12 lg:pt-8">
      <Link href="/map" className="inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-bold text-muted hover:text-foreground">
        <ArrowLeft size={18} aria-hidden="true" />
        {t("pet.back")}
      </Link>

      <div className="mt-2 flex flex-col gap-5 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-8">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-1 lg:order-none">
            <PetGallery photos={pet.photo_paths} animal={pet.animal_type} status={pet.status} urgent={pet.is_urgent} />
          </div>

          <section className="card order-2 flex flex-col gap-4 p-5 lg:order-none" aria-labelledby="pet-title">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Icon size={30} className="text-muted" aria-hidden="true" />
              <h1 id="pet-title" className="text-[clamp(28px,6vw,38px)] leading-tight">
                {kind}
              </h1>
              <span className="chip" style={{ background: color, color: pet.status === "adopted" ? "#182033" : "#fff" }}>
                {t(`status.${pet.status}`)}
              </span>
              {urgent && <span className="chip bg-coral">{t("status.urgent")}</span>}
            </div>

            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-muted">
              {pet.location_label && (
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin size={16} className="shrink-0 text-coral" aria-hidden="true" />
                  <span className="[overflow-wrap:anywhere]">{pet.location_label}</span>
                </span>
              )}
              <span>{agoLabel(t, pet.created_at)}</span>
            </p>

            {conditions.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {conditions.map((c) => (
                  <li key={c} className="rounded-full bg-cream px-3 py-1 text-sm font-bold text-midnight dark:bg-foreground/10 dark:text-foreground">
                    {t(`report.condition.${c}`)}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-1.5">
              <h2 className="eyebrow">{t("pet.about")}</h2>
              {pet.note ? (
                <p className="flex gap-2 text-[17px] leading-relaxed [overflow-wrap:anywhere]">
                  <Quote size={18} className="mt-1 shrink-0 text-brownie" aria-hidden="true" />
                  {pet.note}
                </p>
              ) : (
                <p className="text-muted">{t("pet.noNote")}</p>
              )}
            </div>
          </section>

          <div className="order-5 lg:order-none">
            <PetLocation lat={pet.lat} lng={pet.lng} status={pet.status} urgent={pet.is_urgent} label={pet.location_label} />
          </div>
          <div className="order-6 lg:order-none">
            <Timeline entries={timeline} />
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-3 lg:order-none">
            <HelpPanel
              petId={pet.id}
              status={pet.status}
              userId={user?.id ?? null}
              canSetStatus={mayChangeStatus}
              loginHref={`/join?next=${encodeURIComponent(`/pet/${pet.id}`)}`}
              offers={offers}
              homes={homes}
            />
          </div>
          <div className="order-4 lg:order-none">
            <StatusJourney status={pet.status} />
          </div>
          <div className="order-7 lg:order-none">
            <ShareBar animal={pet.animal_type} />
          </div>
        </div>
      </div>
    </div>
  );
}
