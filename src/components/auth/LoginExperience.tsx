"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CollarTag } from "@/components/volunteer/CollarTag";
import { useT } from "@/i18n/client";
import type { AuthProblem, LoggedIn } from "@/lib/auth-client";
import { DoorScene, Landscape, type LoginMood } from "./DoorScene";
import { LoginPanel, type PanelMood } from "./LoginPanel";

/** The /login page: the door scene on top, the login card below. After logging in the door opens, then we move on. */
export function LoginExperience({ next, initialProblem }: { next: string; initialProblem: AuthProblem | null }) {
  const t = useT();
  const router = useRouter();
  const [mood, setMood] = useState<LoginMood>({ kind: "idle", n: 0 });
  const [welcome, setWelcome] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onMood = (kind: PanelMood) => setMood((m) => ({ kind, n: m.n + 1 }));

  const onDone = (user: LoggedIn) => {
    const name = user.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "";
    setWelcome(name);
    setMood((m) => ({ kind: "happy", n: m.n + 1 }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // let the door open and the tag land, then continue to where the person was going
    timer.current = setTimeout(() => router.replace(next), reduced ? 700 : 2600);
  };

  return (
    // Phone and tablet: the picture on top, the card overlapping its bottom edge.
    // Laptop and desktop: one big sunny landscape with the house on the left and the card floating on the right.
    <div className="relative isolate flex flex-col lg:grid lg:min-h-[38rem] lg:grid-cols-[1.1fr_1fr] lg:overflow-hidden lg:rounded-[40px] lg:shadow-pop lg:ring-1 lg:ring-black/10">
      <Landscape opened={welcome !== null} className="hidden lg:block" />

      <DoorScene mood={mood} opened={welcome !== null} className="h-[17.5rem] sm:h-[23rem] lg:h-auto" />

      <div className="relative z-10 lg:flex lg:items-center lg:justify-center lg:p-10">
      <section
        className="card relative mx-3 -mt-8 flex flex-col gap-5 p-5 sm:mx-6 sm:p-7 lg:mx-0 lg:mt-0 lg:w-full lg:max-w-lg lg:border lg:border-(--glass-line) lg:bg-(--glass) lg:p-9 lg:backdrop-blur-xl lg:backdrop-saturate-150"
        aria-live="polite"
      >
        {welcome === null ? (
          <>
            <header className="flex flex-col gap-1.5">
              <p className="eyebrow">{t("login.eyebrow")}</p>
              <h1 className="text-[clamp(26px,5vw,34px)] leading-tight">{t("login.title")}</h1>
              <p className="text-muted">{t("login.subtitle")}</p>
            </header>
            <LoginPanel next={next} onDone={onDone} onMood={onMood} initialProblem={initialProblem} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-3xl leading-tight [overflow-wrap:anywhere]">{t("login.welcome.title", { name: welcome })}</h1>
            <p className="text-muted">{t("login.welcome.body")}</p>
            <CollarTag name={welcome} role={t("login.welcome.tag")} skills={[]} />
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
