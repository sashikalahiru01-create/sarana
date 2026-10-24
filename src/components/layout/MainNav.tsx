"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/translator";

const links: { href: string; label: MessageKey }[] = [
  { href: "/map", label: "nav.map" },
  { href: "/volunteer", label: "nav.volunteer" },
  { href: "/about", label: "nav.about" },
];

/** Desktop navigation. On phones the BottomBar takes over. */
export function MainNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav aria-label={t("nav.main")} className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-button px-4 font-semibold transition duration-200 hover:bg-cream/60 dark:hover:bg-white/10 ${
              active ? "text-coral" : "text-foreground"
            }`}
          >
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
