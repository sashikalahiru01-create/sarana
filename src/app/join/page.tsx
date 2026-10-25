import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginExperience } from "@/components/auth/LoginExperience";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/auth-redirect";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: `${t("login.title")} – ${t("common.appName")}` };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // someone who is already logged in has nothing to do here
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-10 pt-6 md:max-w-xl lg:max-w-6xl lg:px-6 lg:pt-8">
      <LoginExperience next={next} initialProblem={params.error === "callback" ? "generic" : null} />
    </div>
  );
}
