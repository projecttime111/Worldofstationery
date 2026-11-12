import type { Metadata } from "next";
import { Footer, Header, SkipLink, TopBar } from "@/components/Chrome";
import { QuoteForm } from "@/components/QuoteForm";
import { getPageContent } from "@/lib/content";
import { fmt, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/bulk">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { d } = await getPageContent(lang);
  return pageMetadata(lang, "bulk", d.meta.bulkTitle, d.meta.bulkDescription);
}

function TermsRows({ rows, gstin }: { rows: { label: string; value: string }[]; gstin: string }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap gap-2 border-b border-line px-5 py-4 last:border-b-0">
          <dt className="flex-[0_0_160px] font-bold">{r.label}</dt>
          <dd className="m-0 min-w-0 flex-[1_1_200px]">{fmt(r.value, { gstin })}</dd>
        </div>
      ))}
    </>
  );
}

export default async function BulkPage({ params }: PageProps<"/[lang]/bulk">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const { d, business, offers } = await getPageContent(lang);
  const b = d.bulk;

  return (
    <>
      <SkipLink dict={d} />
      <TopBar dict={d} locale={lang} business={business} />
      <Header dict={d} locale={lang} onHome={false} business={business} offersEnabled={offers.enabled} />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="on-dark bg-navy text-white">
          <div className="container-x flex flex-col gap-4 py-12 md:py-16">
            <span className="self-start rounded-pill bg-yellow px-3.5 py-1.5 text-sm font-bold text-ink">{b.badge}</span>
            <h1 className="m-0 max-w-[860px] font-heading text-[34px] leading-[1.08] font-extrabold sm:text-[42px] lg:text-[52px] lg:leading-[1.05]">
              {b.title}
            </h1>
            <p className="m-0 max-w-[760px] text-[17px] leading-[1.55] text-on-navy md:text-[19px]">{b.text}</p>
          </div>
        </section>

        <section id="quote">
          <div className="container-x flex flex-wrap gap-12 py-12 md:py-16">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-8">
              <div className="flex flex-col gap-3.5">
                <h2 className="m-0 font-heading text-[28px] font-extrabold text-navy md:text-[34px]">{b.supplyTitle}</h2>
                <ul className="m-0 flex flex-col gap-2 pl-5 text-[17px] leading-normal">
                  {b.supply.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3.5">
                <h2 className="m-0 font-heading text-[28px] font-extrabold text-navy md:text-[34px]">{b.termsTitle}</h2>
                <div className="overflow-hidden rounded-card border border-line">
                  <h3 className="m-0 bg-navy px-5 py-3.5 text-base font-bold text-white">{b.retailers}</h3>
                  <dl className="m-0">
                    <TermsRows rows={b.retailRows} gstin={business.gstin} />
                  </dl>
                  <h3 className="m-0 bg-navy px-5 py-3.5 text-base font-bold text-white">{b.institutions}</h3>
                  <dl className="m-0">
                    <TermsRows rows={b.institutionRows} gstin={business.gstin} />
                  </dl>
                </div>
                <p className="m-0 text-sm text-muted">{b.termsNote}</p>
              </div>
            </div>

            <QuoteForm t={d.form} whatsapp={business.phone.whatsapp} />
          </div>
        </section>
      </main>
      <Footer dict={d} locale={lang} business={business} />
    </>
  );
}
