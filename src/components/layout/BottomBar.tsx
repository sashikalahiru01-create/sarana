"use client";

import { Camera, HandHeart, House, Map, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/translator";

const items: { href: string; label: MessageKey; icon: LucideIcon }[] = [
  { href: "/", label: "nav.home", icon: House },
  { href: "/map", label: "nav.map", icon: Map },
  { href: "/report", label: "nav.report", icon: Camera },
  { href: "/volunteer", label: "nav.volunteer", icon: HandHeart },
  { href: "/profile", label: "nav.profile", icon: User },
];

/** Phone navigation. The Report button sits in the middle, raised and coral, so it is always in thumb reach. */
export function BottomBar() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.mobile")}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          const isReport = href === "/report";

          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold transition duration-200 ${
                  isReport ? "" : active ? "text-coral" : "text-muted"
                }`}
              >
                {isReport ? (
                  <span className="-mt-5 grid size-14 place-items-center rounded-button bg-coral text-white shadow-coral transition duration-200 active:scale-95">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                ) : (
                  <Icon size={22} aria-hidden="true" />
                )}
                <span className={isReport ? "text-coral" : ""}>{t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
