import { fallbackMessages, type Messages } from "./messages";

type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];

/** Every valid translation key, e.g. "nav.map". A typo is a compile error. */
export type MessageKey = Paths<Messages>;

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

function lookup(messages: unknown, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

export function createTranslator(messages: Messages): Translate {
  return (key, vars) => {
    const text = lookup(messages, key) ?? lookup(fallbackMessages, key) ?? key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}
