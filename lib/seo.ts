import type { Metadata } from "next";
import { business } from "@/content/business";
import { locales, localePath, ogLocale, type Locale, type Page } from "./i18n";

/** Title, description, canonical, hreflang alternates and Open Graph for one page in one language. */
export function pageMetadata(
  locale: Locale,
  page: Page,
  title: string,
  description: string,
): Metadata {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[`${l}-IN`] = localePath(l, page);
  languages["x-default"] = localePath("en", page);

  return {
    title,
    description,
    alternates: { canonical: localePath(locale, page), languages },
    openGraph: {
      type: "website",
      siteName: business.storeName,
      title,
      description,
      url: localePath(locale, page),
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: business.storeName }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
