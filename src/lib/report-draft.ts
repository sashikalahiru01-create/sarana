import type { AnimalType } from "./domain";

/**
 * A report that is waiting for its author to log in. Photos are binary, so this lives in IndexedDB
 * (localStorage only holds text). If the visitor leaves the page for Google and comes back, the report is still here.
 * Everything here fails quietly: with storage blocked, the report simply cannot be restored.
 */
export type ReportDraft = {
  savedAt: number;
  animal: AnimalType | null;
  conditions: string[];
  note: string;
  contact: string;
  position: { lat: number; lng: number } | null;
  label: string;
  photos: Blob[];
};

const DB = "sarana";
const STORE = "drafts";
const KEY = "report";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        // closing waits for the transaction, so the request above is not cut short
        db.close();
      }),
  );
}

export async function saveReportDraft(draft: Omit<ReportDraft, "savedAt">): Promise<void> {
  try {
    await run("readwrite", (s) => s.put({ ...draft, savedAt: Date.now() }, KEY));
  } catch {
    // storage blocked or full
  }
}

/** The waiting report, if there is a recent one. */
export async function loadReportDraft(): Promise<ReportDraft | null> {
  try {
    const draft = (await run("readonly", (s) => s.get(KEY))) as ReportDraft | undefined;
    if (!draft || Date.now() - draft.savedAt > MAX_AGE_MS || !Array.isArray(draft.photos)) return null;
    return draft;
  } catch {
    return null;
  }
}

export async function clearReportDraft(): Promise<void> {
  try {
    await run("readwrite", (s) => s.delete(KEY));
  } catch {
    // nothing to clear
  }
}
