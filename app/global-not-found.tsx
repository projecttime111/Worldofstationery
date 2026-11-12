import type { Metadata } from "next";
import { LogoMark } from "@/components/LogoMark";
import en from "@/content/en.json";
import hi from "@/content/hi.json";
import mr from "@/content/mr.json";
import { fontClasses } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: `${en.notFound.title} | World of Stationery`,
  robots: { index: false },
};

/** One static 404 page for every language, since a static host cannot tell which one to show. */
export default function GlobalNotFound() {
  const versions = [
    { lang: "en", href: "/en/", d: en },
    { lang: "hi", href: "/hi/", d: hi },
    { lang: "mr", href: "/mr/", d: mr },
  ];
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <main className="container-x flex min-h-dvh flex-col items-start justify-center gap-6 py-12">
          <LogoMark id="nf" size={72} />
          {versions.map(({ lang, href, d }) => (
            <div key={lang} lang={lang} className="flex flex-col gap-1">
              <h1 className="m-0 font-heading text-[28px] font-extrabold text-navy">{d.notFound.title}</h1>
              <a href={href} className="inline-flex min-h-11 items-center text-[17px] font-semibold">
                {d.notFound.back}
              </a>
            </div>
          ))}
        </main>
      </body>
    </html>
  );
}
