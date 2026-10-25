"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Brownie } from "@/components/brownie/Brownie";
import { PetCard } from "@/components/map/PetCard";
import { useT } from "@/i18n/client";
import type { HelpRole } from "@/lib/profile-data";
import type { Pet } from "@/lib/pets";

type Props = {
  title: string;
  empty: string;
  emptyCta: string;
  emptyHref: string;
  items: { pet: Pet; role?: HelpRole }[];
};

/** A list of animals as cards, each optionally tagged with what the person did for it. Empty: a sleeping Brownie and a way forward. */
export function PetList({ title, empty, emptyCta, emptyHref, items }: Props) {
  const t = useT();

  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={title}>
      <h2 className="flex items-center gap-2 text-xl">
        {title}
        {items.length > 0 && <span className="rounded-full bg-coral/12 px-2.5 py-0.5 font-heading text-sm font-extrabold tabular-nums text-coral-ink dark:text-brownie">{items.length}</span>}
      </h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="w-28">
            <Brownie mood="sleeping" collar label="" />
          </div>
          <p className="max-w-[30ch] text-muted">{empty}</p>
          <Link href={emptyHref} className="btn btn-ghost">
            {emptyCta}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ pet, role }) => (
            <li key={pet.id} className="flex flex-col gap-1.5">
              {role && <p className="px-1 text-[13px] font-bold text-muted">{t(`profile.helped.role.${role}`)}</p>}
              <PetCard pet={pet} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
