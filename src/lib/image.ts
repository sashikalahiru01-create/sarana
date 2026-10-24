import { PHOTO_MAX_WIDTH, PHOTO_TARGET_BYTES } from "./domain";

const MIN_WIDTH = 800;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrinks a photo in the browser before upload: at most 1600 px wide and about 200 KB.
 * Tries WebP first; Safari cannot encode WebP and silently returns PNG, so we fall back to JPEG.
 * Throws if the browser cannot read the file.
 */
export async function compressImage(file: File): Promise<Blob> {
  // imageOrientation applies the phone's EXIF rotation so photos are not sideways
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    let width = Math.min(bitmap.width, PHOTO_MAX_WIDTH);
    let best: Blob | null = null;

    for (let round = 0; round < 6; round++) {
      const height = Math.round((bitmap.height * width) / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.drawImage(bitmap, 0, 0, width, height);

      for (const quality of [0.82, 0.72, 0.62, 0.52]) {
        let blob = await toBlob(canvas, "image/webp", quality);
        if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
        if (!blob) throw new Error("could not encode image");
        best = blob;
        if (blob.size <= PHOTO_TARGET_BYTES) return blob;
      }

      if (width <= MIN_WIDTH) break;
      width = Math.max(MIN_WIDTH, Math.round(width * 0.85));
    }
    return best!;
  } finally {
    bitmap.close();
  }
}
