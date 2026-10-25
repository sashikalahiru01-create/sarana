"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { signOut } from "@/lib/auth-actions";

type Props = { name: string | null; email: string | null; avatarUrl: string | null };

/** The round button in the header once someone is logged in: their picture or first letter, with a small menu to log out. */
export function AccountMenu({ name, email, avatarUrl }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const label = name ?? email ?? t("nav.account");
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();

  // close on a tap outside or Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("pointerdown", onPointer);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("pointerdown", onPointer);
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative max-[359px]:hidden">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("nav.account")}: ${label}`}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center overflow-hidden rounded-full bg-linear-to-br from-[#f47a50] to-coral font-heading text-lg font-extrabold text-white shadow-coral transition duration-200 ease-spring hover:scale-105 active:scale-95"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a small profile picture from Google
          <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 animate-[pop-in_0.25s_cubic-bezier(0.34,1.4,0.64,1)] origin-top-right rounded-2xl p-2 shadow-pop"
        >
          <div className="px-3 py-2">
            {name && <p className="font-heading font-extrabold [overflow-wrap:anywhere]">{name}</p>}
            {email && <p className="text-sm text-muted [overflow-wrap:anywhere]">{email}</p>}
          </div>
          <form action={signOut}>
            <button type="submit" role="menuitem" className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-semibold transition duration-200 hover:bg-foreground/8">
              <LogOut size={18} aria-hidden="true" />
              {t("nav.logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
