import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandTile";
import { Footer, Header, SkipLink, TopBar } from "@/components/Chrome";
import { whatsappUrl } from "@/content/business";
import { getPageContent, type Catalogue } from "@/lib/content";
import { fmt, isLocale, type Dict, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/catalogues">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { d } = await getPageContent(lang);
  return pageMetadata(lang, "catalogues", d.meta.cataloguesTitle, d.meta.cataloguesDescription);
}

export default async function CataloguesPage({ params }: PageProps<"/[lang]/catalogues">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const { d, business, offers, catalogues } = await getPageContent(lang);
  const c = d.catalogues;
  const whatsapp = business.phone.whatsapp;

  return (
    <>
      <SkipLink dict={d} />
      <TopBar dict={d} locale={lang} business={business} />
      <Header dict={d} locale={lang} onHome={false} business={business} offersEnabled={offers.enabled} />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="bg-paper">
          <div className="container-x flex flex-col gap-3 py-12 md:py-16">
            <h1 className="m-0 font-heading text-[34px] leading-[1.08] font-extrabold text-navy sm:text-[42px] lg:text-[52px]">
              {c.title}
            </h1>
            <p className="m-0 max-w-[760px] text-[17px] leading-[1.55] text-body md:text-[19px]">{c.intro}</p>
          </div>
        </section>

        <section id="list" aria-label={c.title}>
          <ul className="container-x section-y m-0 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogues.map((cat) => (
              <CatalogueCard key={cat.slug} cat={cat} d={d} locale={lang} whatsapp={whatsapp} />
            ))}
            <li className="flex flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed border-navy p-6 text-center">
              <h2 className="m-0 font-heading text-[24px] font-extrabold text-navy">{c.askTitle}</h2>
              <a href={whatsappUrl(whatsapp, c.askMessage)} target="_blank" rel="noopener" className="btn-wa">
                {c.askButton}
              </a>
            </li>
          </ul>
        </section>
      </main>
      <Footer dict={d} locale={lang} business={business} />
    </>
  );
}

function CatalogueCard({ cat, d, locale, whatsapp }: { cat: Catalogue; d: Dict; locale: Locale; whatsapp: string }) {
  const c = d.catalogues;
  const categories = cat.categories[locale];
  return (
    <li id={cat.slug} className="flex scroll-mt-4 flex-col overflow-hidden rounded-card border border-line bg-white">
      <div className="flex h-[110px] items-center justify-center border-b border-line">
        <BrandLogo
          brand={{ name: cat.name, logo: cat.logo, width: cat.logoWidth ?? undefined, height: cat.logoHeight ?? undefined }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h2 className="m-0 text-xl font-bold">{cat.name}</h2>
        {categories && <p className="m-0 text-[15px] leading-normal text-body">{categories}</p>}
        <div className="mt-auto flex flex-col gap-2 pt-3">
          {cat.pdf ? (
            <>
              <a href={cat.pdf} target="_blank" rel="noopener" className="btn-outline">
                {c.view} <span className="sr-only">{c.newTab}</span>
              </a>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                <a href={cat.pdf} download className="inline-flex min-h-11 items-center font-semibold">
                  {c.download}
                </a>
                {cat.updated && <span>{fmt(c.updated, { date: cat.updated })}</span>}
              </div>
            </>
          ) : (
            <a href={whatsappUrl(whatsapp, fmt(c.requestMessage, { brand: cat.name }))} target="_blank" rel="noopener" className="btn-wa">
              {c.request}
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
