"use client";

import { Check, Link2, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import type { AnimalType } from "@/lib/domain";

const FACEBOOK_BLUE = "#1877f2";
const WHATSAPP_GREEN = "#1f8a70";

/** Share to WhatsApp or Facebook, or copy the link. The address is read when the button is pressed. */
export function ShareBar({ animal }: { animal: AnimalType }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const text = t("pet.share.text", { type: t(`report.details.${animal}`) });
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard blocked: fall back to the browser's own share sheet if it has one
      if (navigator.share) void navigator.share({ title: text, url: window.location.href }).catch(() => {});
    }
  };

  return (
    <section className="card flex flex-col gap-3 p-5" aria-labelledby="share-title">
      <h2 id="share-title" className="text-xl">
        {t("pet.share.title")}
      </h2>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        <button type="button" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${text} ${window.location.href}`)}`)} className="btn px-3 text-white" style={{ background: WHATSAPP_GREEN }}>
          <MessageCircle size={18} aria-hidden="true" />
          {t("pet.share.whatsapp")}
        </button>
        <button type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} className="btn px-3 text-white" style={{ background: FACEBOOK_BLUE }}>
          <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-full bg-white text-[13px] font-extrabold leading-none" style={{ color: FACEBOOK_BLUE }}>
            f
          </span>
          {t("pet.share.facebook")}
        </button>
        <button type="button" onClick={copy} className="btn btn-ghost px-3" aria-live="polite">
          {copied ? <Check size={18} className="text-green" aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
          {copied ? t("pet.share.copied") : t("pet.share.copy")}
        </button>
      </div>
    </section>
  );
}
