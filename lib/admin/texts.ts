import type { Dict } from "../i18n";

/** One editable text: its path in content/<lang>.json (e.g. "hero.title") and its value. */
export type TextEntry = { path: string; value: string };

/** Every text (string) in a dictionary, with its path. Keys starting with "_" are notes, not site text. */
export function flattenTexts(node: unknown, prefix = ""): TextEntry[] {
  if (typeof node === "string") return prefix ? [{ path: prefix, value: node }] : [];
  if (!node || typeof node !== "object") return [];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    key.startsWith("_") ? [] : flattenTexts(value, prefix ? `${prefix}.${key}` : key),
  );
}

export const textSections = (en: Dict) =>
  Object.keys(en).filter((k) => !k.startsWith("_") && flattenTexts((en as Record<string, unknown>)[k], k).length);

const SECTION_NAMES: Record<string, string> = {
  meta: "Page titles (search results)",
  a11y: "Screen reader labels",
  topbar: "Top bar",
  header: "Header and menu",
  hero: "Hero (top of home page)",
  numbers: "Numbers strip",
  products: "What we stock",
  brands: "Brands",
  yamunaCard: "Yamuna Enterprises card",
  about: "About",
  offers: "Offers",
  serve: "Who we serve",
  how: "How it works",
  visit: "Visit us",
  footer: "Footer",
  bulk: "Bulk and wholesale page",
  form: "Quotation form",
  catalogues: "Catalogues page",
  notFound: "Page not found",
};

export const sectionName = (key: string) => SECTION_NAMES[key] ?? key;

/** "serve.cards.1.text" → "Cards 2 · text" (positions counted from 1 for people). */
export function textLabel(path: string) {
  return path
    .split(".")
    .slice(1)
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : part.replace(/([A-Z])/g, " $1").toLowerCase()))
    .join(" · ");
}
