import en from "@/content/en.json";
import hi from "@/content/hi.json";
import mr from "@/content/mr.json";

export const locales = ["en", "hi", "mr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dict = typeof en;

/** Texts as written in content/<lang>.json. Pages use lib/content.ts, which adds the admin's edits. */
export const bundledDicts: Record<Locale, Dict> = { en, hi: hi as Dict, mr: mr as Dict };

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);


/** Value for <html lang> and Open Graph locale. */
export const htmlLang: Record<Locale, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
export const ogLocale: Record<Locale, string> = { en: "en_IN", hi: "hi_IN", mr: "mr_IN" };

/** Labels shown in the switcher, always in their own language. */
export const localeLabels: Record<Locale, string> = { en: "English", hi: "हिंदी", mr: "मराठी" };

/** Replace {key} placeholders. Numbers use Indian grouping (4,999 / 1,00,000). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    if (value === undefined) return match;
    return typeof value === "number" ? value.toLocaleString("en-IN") : value;
  });
}

/** Path for a page in a given language, always with a trailing slash. */
export type Page = "" | "bulk" | "catalogues";

export const localePath = (locale: Locale, page: Page = "") =>
  page ? `/${locale}/${page}/` : `/${locale}/`;
