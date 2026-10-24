"use client";

import { Share2 } from "lucide-react";

/** Shares Sarana: the phone's share sheet where there is one, otherwise a WhatsApp message. */
export function ShareTile({ className, title, body, text }: { className: string; title: string; body: string; text: string }) {
  const share = async () => {
    const url = location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sarana", text, url });
      } catch {
        // the person closed the share sheet
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button type="button" onClick={share} className={className}>
      <span className="grid size-12 place-items-center rounded-2xl bg-green/12 text-green transition duration-300 group-hover:rotate-6 group-hover:scale-110 dark:text-[#4fc3a5]">
        <Share2 size={24} aria-hidden="true" />
      </span>
      <strong className="font-heading text-lg">{title}</strong>
      <span className="text-muted">{body}</span>
    </button>
  );
}
