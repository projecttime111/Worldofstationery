import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { business } from "@/content/business";
import { htmlLang, isLocale, locales } from "@/lib/i18n";
import { fontClasses } from "../fonts";
import "../globals.css";

export const dynamicParams = false;

// Pages are prerendered and refreshed within seconds when an admin publishes (lib/content.ts).
// The hourly refresh is a safety net: a page built while the database was unreachable
// (and so built from the bundled files) catches up on its own.
export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  applicationName: business.storeName,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1B3A6B",
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={htmlLang[lang]} className={fontClasses}>
      <head>
        {/* Hindi and Marathi headings need the Devanagari Baloo file at once (see BalooDeva in globals.css). */}
        {lang !== "en" && (
          <link rel="preload" href="/fonts/baloo2-800-devanagari.woff2" as="font" type="font/woff2" crossOrigin="" />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
