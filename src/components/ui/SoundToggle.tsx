"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useT } from "@/i18n/client";
import { getSoundOn, playBark, setSoundOn, subscribeSound } from "@/lib/dog-sound";

/** Mutes or unmutes Brownie. The choice is remembered. Turning sound on plays a small yip as a preview. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const on = useSyncExternalStore(subscribeSound, getSoundOn, () => true);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t(on ? "common.soundOn" : "common.soundOff")}
      title={t(on ? "common.soundOn" : "common.soundOff")}
      onClick={() => {
        setSoundOn(!on);
        if (!on) playBark("yip");
      }}
      className={`glass grid size-11 place-items-center rounded-full text-foreground transition duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      {on ? <Volume2 size={19} aria-hidden="true" /> : <VolumeX size={19} aria-hidden="true" />}
    </button>
  );
}
