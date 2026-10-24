"use client";

import { Camera, Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import { useRef } from "react";
import { MAX_PHOTOS } from "@/lib/domain";
import { useT } from "@/i18n/client";

export type Photo = { id: string; blob: Blob; url: string };

type Props = {
  photos: Photo[];
  busy: boolean;
  error: string | null;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
};

export function PhotoStep({ photos, busy, error, onAdd, onRemove }: Props) {
  const t = useT();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const full = photos.length >= MAX_PHOTOS;

  const handle = (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    input.value = ""; // lets the same photo be picked again
    if (files.length) onAdd(files);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">{t("report.photo.hint")}</p>

      {/* capture="environment" opens the back camera directly on phones */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} onChange={(e) => handle(e.currentTarget)} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => handle(e.currentTarget)} />

      {photos.length === 0 ? (
        <div className="flex flex-col items-stretch gap-3 rounded-card border-2 border-dashed border-line p-6">
          <button type="button" className="btn btn-primary !min-h-14" disabled={busy} onClick={() => cameraRef.current?.click()}>
            {busy ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Camera size={20} aria-hidden="true" />}
            {busy ? t("report.photo.working") : t("report.photo.take")}
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => galleryRef.current?.click()}>
            <ImageIcon size={20} aria-hidden="true" />
            {t("report.photo.choose")}
          </button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <li key={photo.id} className="relative aspect-square overflow-hidden rounded-card bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview, not a remote image */}
                <img src={photo.url} alt={t("report.photo.alt", { n: i + 1 })} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove(photo.id)}
                  aria-label={t("report.photo.remove", { n: i + 1 })}
                  className="absolute right-1 top-1 grid size-11 place-items-center rounded-full bg-black/55 text-white"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
            {!full && (
              <li className="aspect-square">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => galleryRef.current?.click()}
                  className="grid size-full place-items-center rounded-card border-2 border-dashed border-line text-muted transition duration-200 hover:border-coral hover:text-coral"
                >
                  {busy ? <Loader2 className="animate-spin" size={26} aria-hidden="true" /> : <Plus size={26} aria-hidden="true" />}
                  <span className="sr-only">{t("report.photo.addMore")}</span>
                </button>
              </li>
            )}
          </ul>

          {!full && (
            <button type="button" className="btn btn-ghost self-start" disabled={busy} onClick={() => cameraRef.current?.click()}>
              <Camera size={18} aria-hidden="true" />
              {busy ? t("report.photo.working") : t("report.photo.addMore")}
            </button>
          )}
          {full && <p className="text-sm text-muted">{t("report.photo.limit", { max: MAX_PHOTOS })}</p>}
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-coral-ink dark:text-brownie">
          {error}
        </p>
      )}
    </div>
  );
}
