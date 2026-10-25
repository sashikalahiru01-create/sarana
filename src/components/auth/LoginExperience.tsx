"use client";

import { ArrowRight, HandHeart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CollarTag } from "@/components/volunteer/CollarTag";
import { VolunteerForm } from "@/components/volunteer/VolunteerForm";
import { useT } from "@/i18n/client";
import type { AuthProblem, LoggedIn } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase/client";
import { DoorScene, type LoginMood } from "./DoorScene";
import { LoginPanel, type PanelMood } from "./LoginPanel";

type Destination = "report" | "pet" | "volunteer" | "profile" | "map" | "home" | "other";

/** What the person was on their way to, so the button can say it in words. */
function destinationOf(next: string): Destination {
  if (next.startsWith("/report")) return "report";
  if (next.startsWith("/pet/")) return "pet";
  if (next.startsWith("/volunteer")) return "volunteer";
  if (next.startsWith("/profile")) return "profile";
  if (next.startsWith("/map")) return "map";
  if (next === "/") return "home";
  return "other";
}

type Joined = { name: string; isNew: boolean; offerVolunteer: boolean };

/**
 * The /join page: the door scene, and the join card beside or below it. When someone has joined, the door opens
 * and the card stays until they choose what to do next (there is no automatic jump): a new member is offered the
 * volunteer details (they can skip), and everyone gets a clear button to where they were going.
 */
export function LoginExperience({ next, initialProblem }: { next: string; initialProblem: AuthProblem | null }) {
  const t = useT();
  const [mood, setMood] = useState<LoginMood>({ kind: "idle", n: 0 });
  const [joined, setJoined] = useState<Joined | null>(null);
  const [volunteerOpen, setVolunteerOpen] = useState(false);

  const onMood = (kind: PanelMood) => setMood((m) => ({ kind, n: m.n + 1 }));

  const onDone = async (user: LoggedIn, info: { isNew: boolean }) => {
    const name = user.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "";
    setMood((m) => ({ kind: "happy", n: m.n + 1 }));
    setJoined({ name, isNew: info.isNew, offerVolunteer: false });
    // A new member is offered the volunteer details, unless they already have them.
    if (info.isNew) {
      const { data } = await createClient().from("volunteers").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!data) setJoined({ name, isNew: true, offerVolunteer: true });
    }
  };

  const goLabel = t(`login.welcome.go.${destinationOf(next)}`);

  return (
    // Phone and tablet: the picture on top, the card overlapping its bottom edge.
    // Laptop and desktop: two separate cards side by side, the picture on the left and the card on the right.
    <div className="relative isolate flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-stretch lg:gap-8">
      <DoorScene mood={mood} opened={joined !== null} className="h-[17.5rem] sm:h-[23rem] lg:h-auto lg:min-h-[36rem]" />

      <div className="relative z-10 lg:flex lg:items-center">
        {joined && volunteerOpen ? (
          <div className="mx-3 -mt-8 flex w-full flex-col gap-3 sm:mx-6 lg:mx-0 lg:mt-0">
            <VolunteerForm onboarding={{ href: next, label: goLabel, name: joined.name || null }} />
            <Link href={next} className="btn btn-ghost self-start">
              {t("login.welcome.volunteerSkip")}
            </Link>
          </div>
        ) : (
          <section
            className="card relative mx-3 -mt-8 flex flex-col gap-5 p-5 sm:mx-6 sm:p-7 lg:mx-0 lg:mt-0 lg:w-full lg:p-9"
            aria-live="polite"
          >
            {joined === null ? (
              <>
                <header className="flex flex-col gap-1.5">
                  <p className="eyebrow">{t("login.eyebrow")}</p>
                  <h1 className="text-[clamp(26px,5vw,34px)] leading-tight">{t("login.title")}</h1>
                  <p className="text-muted">{t("login.subtitle")}</p>
                </header>
                <LoginPanel next={next} onDone={onDone} onMood={onMood} initialProblem={initialProblem} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-3xl leading-tight [overflow-wrap:anywhere]">
                  {t(joined.isNew ? "login.welcome.title" : "login.welcome.returning", { name: joined.name })}
                </h1>
                <p className="text-muted">{t("login.welcome.body")}</p>

                {joined.offerVolunteer ? (
                  <div className="flex w-full flex-col gap-3 rounded-card bg-linear-to-br from-gold/25 to-coral/10 p-5 text-left">
                    <span className="grid size-11 place-items-center rounded-2xl bg-gold/40 text-[#8a5b00]">
                      <HandHeart size={22} aria-hidden="true" />
                    </span>
                    <h2 className="text-xl">{t("login.welcome.volunteerTitle")}</h2>
                    <p className="text-muted">{t("login.welcome.volunteerBody")}</p>
                    <button type="button" className="btn btn-primary" onClick={() => setVolunteerOpen(true)}>
                      {t("login.welcome.volunteerYes")}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                    <Link href={next} className="btn btn-ghost">
                      {t("login.welcome.volunteerSkip")}
                    </Link>
                    <p className="text-center text-sm text-muted">{t("login.welcome.volunteerLater")}</p>
                  </div>
                ) : (
                  <>
                    {!joined.isNew && <CollarTag name={joined.name} role={t("login.welcome.tag")} skills={[]} />}
                    <Link href={next} className="btn btn-primary w-full !min-h-14">
                      {goLabel}
                      <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
