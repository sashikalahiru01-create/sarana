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

/**
 * Phone navigation: a frosted pill that floats above the page.
 * The Report button sits in the middle, raised and coral, so it is always in thumb reach.
 */
export function BottomBar() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.mobile")}
      className="bottom-bar fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto max-w-md rounded-[28px] border border-(--glass-line) bg-(--glass) shadow-pop backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <ul className="grid grid-cols-5 items-end px-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          const isReport = href === "/report";

          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition duration-200 ${
                  isReport ? "text-coral-ink dark:text-brownie" : active ? "text-foreground" : "text-muted"
                }`}
              >
                {isReport ? (
                  <span className="btn-primary -mt-6 grid size-14 place-items-center rounded-[18px] ring-4 ring-background transition duration-200 ease-spring active:scale-90">
                    <Icon size={26} className="text-white" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition duration-300 ${active ? "bg-coral/15 text-coral-ink dark:text-brownie" : ""}`}
                  >
                    <Icon size={21} aria-hidden="true" />
                  </span>
                )}
                <span>{t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
