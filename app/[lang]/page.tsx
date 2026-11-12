import type { Metadata } from "next";
import Image from "next/image";
import { BrandTile } from "@/components/BrandTile";
import { Footer, Header, SkipLink, TopBar } from "@/components/Chrome";
import { HeroScene } from "@/components/HeroScene";
import { JsonLd } from "@/components/JsonLd";
import { YamunaMark } from "@/components/LogoMark";
import { whatsappUrl, type Brand, type Business } from "@/content/business";
import type { CardImage } from "@/content/photos";
import { getPageContent, type Offers as OffersData } from "@/lib/content";
import { fmt, isLocale, localePath, type Dict, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { d } = await getPageContent(lang);
  return pageMetadata(lang, "", d.meta.homeTitle, d.meta.homeDescription);
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const { d, business, offers, categoryImages } = await getPageContent(lang);

  return (
    <>
      <SkipLink dict={d} />
      <TopBar dict={d} locale={lang} business={business} />
      <Header dict={d} locale={lang} onHome business={business} offersEnabled={offers.enabled} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero d={d} locale={lang} business={business} />
        <Numbers d={d} />
        <Products d={d} images={categoryImages} />
        <Brands d={d} locale={lang} business={business} />
        <About d={d} locale={lang} />
        {offers.enabled && <Offers d={d} offers={offers} />}
        <WhoWeServe d={d} locale={lang} offersEnabled={offers.enabled} />
        <HowItWorks d={d} />
        <Visit d={d} business={business} />
      </main>
      <Footer dict={d} locale={lang} business={business} />
      <JsonLd business={business} locale={lang} description={d.meta.homeDescription} />
    </>
  );
}

function Hero({ d, locale, business }: { d: Dict; locale: Locale; business: Business }) {
  return (
    <section id="top" className="bg-paper">
      <div className="container-x section-y flex flex-wrap items-center gap-8 md:gap-12">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-5">
          <span className="self-start rounded-pill bg-yellow px-3.5 py-1.5 text-sm font-bold text-ink">{d.hero.badge}</span>
          <h1 className="m-0 font-heading text-[36px] leading-[1.06] font-extrabold text-navy sm:text-[46px] lg:text-[58px] lg:leading-[1.02]">
            {d.hero.title}
          </h1>
          <p className="m-0 text-[17px] leading-[1.55] text-body md:text-[19px]">{d.hero.text}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a href={whatsappUrl(business.phone.whatsapp)} target="_blank" rel="noopener" className="btn-wa">
              {d.hero.ctaWhatsapp}
            </a>
            <a href={localePath(locale, "bulk")} className="btn-outline">
              {d.hero.ctaBulk}
            </a>
          </div>
        </div>
        <HeroScene chips={d.hero.chips} className="h-[280px] w-full min-w-0 flex-[1_1_420px] sm:h-[340px] lg:h-[400px]" />
      </div>
    </section>
  );
}

function Numbers({ d }: { d: Dict }) {
  return (
    <section aria-label={d.a11y.numbersLabel} className="bg-navy text-white">
      <ul className="container-x m-0 grid list-none grid-cols-2 gap-6 py-9 text-center md:grid-cols-4">
        {d.numbers.map((n) => (
          <li key={n.value}>
            <div className="font-heading text-[40px] leading-none font-extrabold text-yellow md:text-[48px]">{n.value}</div>
            <div className="mt-1.5 text-base">{n.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Products({ d, images }: { d: Dict; images: CardImage[] }) {
  return (
    <section id="products">
      <div className="container-x section-y flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="h2">{d.products.title}</h2>
          <p className="m-0 text-[17px] text-body">{d.products.text}</p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {d.products.categories.map((c, i) => {
            const img = images[i];
            const isPhoto = img && !img.src.endsWith(".svg");
            return (
              <li key={c.name} className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-white">
                <div className="h-40 bg-paper">
                  {img && (
                    // Decorative: the card title already names the category.
                    <Image
                      src={img.src}
                      width={img.width}
                      height={img.height}
                      alt=""
                      aria-hidden="true"
                      unoptimized
                      loading="lazy"
                      className={`h-full w-full ${isPhoto ? "object-cover" : "object-contain"}`}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 px-5 pt-[18px] pb-[22px]">
                  <h3 className="m-0 text-lg font-bold">{c.name}</h3>
                  <p className="m-0 text-[15px] leading-normal text-body">{c.items}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Brands({ d, locale, business }: { d: Dict; locale: Locale; business: Business }) {
  const catalogues = localePath(locale, "catalogues");
  const tile = (b: Brand, className: string, large = false) => (
    <BrandTile
      brand={b}
      href={`${catalogues}#${b.slug}`}
      label={fmt(d.brands.tileLabel, { brand: b.name })}
      className={className}
      large={large}
    />
  );
  const { row2, row3 } = business.authorisedBrands;
  return (
    <section id="brands" className="bg-paper">
      <div className="container-x section-y flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="h2">{d.brands.title}</h2>
          <p className="m-0 text-[17px] text-body">{d.brands.text}</p>
        </div>

        {/* Pyramid: key partner, then 2, then 4 */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-[360px] pt-3">
            <span className="absolute top-0 left-1/2 z-10 -translate-x-1/2 rounded-pill bg-navy px-3.5 py-1 text-xs font-bold tracking-[0.08em] whitespace-nowrap text-white uppercase">
              {d.brands.keyPartner}
            </span>
            {tile(business.keyPartner, "h-[130px] border-2 border-navy sm:h-[150px]", true)}
          </div>
          <ul className="m-0 grid w-full max-w-[416px] list-none grid-cols-2 gap-4 p-0">
            {row2.map((b) => (
              <li key={b.slug}>{tile(b, "h-[110px]")}</li>
            ))}
          </ul>
          <ul className="m-0 grid w-full max-w-[848px] list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
            {row3.map((b) => (
              <li key={b.slug}>{tile(b, "h-[110px]")}</li>
            ))}
          </ul>
        </div>

        <h3 className="mt-3 mb-0 text-xl font-bold">{d.brands.alsoTitle}</h3>
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:flex sm:flex-wrap">
          {business.alsoDealIn.map((b) => (
            <li key={b.slug} className="sm:w-[200px]">
              {tile(b, "h-[110px]")}
            </li>
          ))}
          <li className="sm:w-[200px]">
            <a
              href={whatsappUrl(business.phone.whatsapp, d.brands.moreMessage)}
              target="_blank"
              rel="noopener"
              className="flex h-[110px] flex-col items-center justify-center rounded-tile border-2 border-dashed border-navy bg-white text-center no-underline hover:bg-white/60"
            >
              <span className="font-heading text-[34px] leading-none font-extrabold text-navy">{d.brands.moreValue}</span>
              <span className="mt-1 text-sm font-semibold text-body">{d.brands.moreLabel}</span>
            </a>
          </li>
        </ul>

        <div>
          <a href={catalogues} className="btn-outline">
            {d.brands.browse}
          </a>
        </div>
      </div>
    </section>
  );
}

function YamunaCard({ d, locale }: { d: Dict; locale: Locale }) {
  return (
    <div className="flex min-w-0 flex-[1_1_380px] flex-col items-center justify-center gap-5 rounded-photo bg-yamuna px-6 py-10 text-center text-white sm:min-h-[420px]">
      <YamunaMark size={120} onDark />
      <div className="flex flex-col items-center leading-none">
        <span className="font-heading text-[52px] font-extrabold tracking-[0.02em] sm:text-[60px]">{d.yamunaCard.name}</span>
        <span className="mt-1 text-[13px] font-semibold tracking-[0.42em] text-yamuna-pink">{d.yamunaCard.sub}</span>
        {/* On English pages the phone's own Devanagari font is used, so the page does not download Baloo's Devanagari file for one line. */}
        <span lang="mr" className={`mt-3 text-[22px] font-extrabold ${locale === "en" ? "" : "font-heading"}`}>
          यमुना एंटरप्रायझेस
        </span>
      </div>
      <div className="h-px w-24 bg-yamuna-line" aria-hidden="true" />
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px] text-yamuna-pink">
        {d.yamunaCard.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function About({ d, locale }: { d: Dict; locale: Locale }) {
  return (
    <section id="about">
      <div className="container-x section-y flex flex-wrap items-center gap-8 md:gap-12">
        <YamunaCard d={d} locale={locale} />
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-[18px]">
          <span className="text-sm font-bold tracking-[0.08em] text-muted uppercase">{d.about.eyebrow}</span>
          <h2 className="h2">{d.about.title}</h2>
          {d.about.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="m-0 text-[17px] leading-[1.65] text-body">
              {p}
            </p>
          ))}
          <ul className="m-0 mt-1 flex list-none flex-wrap gap-2.5 p-0">
            {d.about.chips.map((c) => (
              <li key={c} className="rounded-pill bg-paper px-3.5 py-2 text-sm font-semibold">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Offers({ d, offers }: { d: Dict; offers: OffersData }) {
  const o = offers;
  const t = d.offers;
  return (
    <section id="offers" className="bg-paper">
      <div className="container-x section-y flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h2 className="h2">{t.title}</h2>
          <p className="m-0 text-base text-muted">{fmt(t.terms, { start: o.startDate, end: o.endDate })}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="on-dark flex flex-col gap-3.5 rounded-card bg-navy p-7 text-white">
            <span className="text-[13px] font-bold tracking-[0.08em] text-yellow uppercase">{t.bill.label}</span>
            <div className="flex justify-between gap-3 border-b border-navy-line pb-2.5">
              <span className="text-base">{fmt(t.bill.row, { min: o.billTier1Min })}</span>
              <strong className="font-heading text-2xl font-extrabold">{fmt(t.bill.off, { pct: o.billTier1Percent })}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-base">{fmt(t.bill.row, { min: o.billTier2Min })}</span>
              <strong className="font-heading text-2xl font-extrabold">{fmt(t.bill.off, { pct: o.billTier2Percent })}</strong>
            </div>
            <p className="m-0 text-[15px] leading-normal text-on-navy">
              {fmt(t.bill.gift, { pct: o.billTier2Percent, value: o.giftPackValue })}
            </p>
          </div>
          <div className="flex flex-col gap-3.5 rounded-card bg-yellow p-7 text-ink">
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase">{t.refer.label}</span>
            <p className="m-0 font-heading text-[28px] leading-[1.15] font-extrabold">
              {fmt(t.refer.title, { save: o.referFriendSaves, earn: o.referYouEarn })}
            </p>
            <p className="m-0 text-[15px] leading-normal">
              {fmt(t.refer.text, { save: o.referFriendSaves, earn: o.referYouEarn, min: o.referMinFirstBill })}
            </p>
          </div>
          <div className="flex flex-col gap-3.5 rounded-card border-2 border-navy bg-white p-[26px]">
            <span className="text-[13px] font-bold tracking-[0.08em] text-navy uppercase">{t.gold.label}</span>
            <p className="m-0 font-heading text-[28px] leading-[1.15] font-extrabold text-navy">
              {fmt(t.gold.title, { visits: o.goldVisits, spend: o.goldYearlySpend })}
            </p>
            <p className="m-0 text-[15px] leading-normal text-body">{fmt(t.gold.text, { pct: o.goldExtraPercent })}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoWeServe({ d, locale, offersEnabled }: { d: Dict; locale: Locale; offersEnabled: boolean }) {
  return (
    <section id="serve">
      <div className="container-x section-y flex flex-col gap-8">
        <h2 className="h2">{d.serve.title}</h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {d.serve.cards.map((c) => (
            <li key={c.title} className="flex flex-col gap-2.5 rounded-card border border-line p-6">
              <h3 className="m-0 text-xl font-bold">{c.title}</h3>
              <p className="m-0 text-[15px] leading-[1.55] text-body">
                {!offersEnabled && "textNoOffers" in c ? c.textNoOffers : c.text}
              </p>
              {c.link && (
                <a href={localePath(locale, "bulk")} className="mt-auto inline-flex min-h-11 items-center text-[15px] font-semibold">
                  {c.link}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks({ d }: { d: Dict }) {
  return (
    <section id="how" className="on-dark bg-navy text-white">
      <div className="container-x section-y flex flex-col gap-8">
        <h2 className="h2 text-white">{d.how.title}</h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {d.how.steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2.5">
              <span aria-hidden="true" className="font-heading text-[44px] leading-none font-extrabold text-yellow">
                {i + 1}
              </span>
              <h3 className="m-0 text-xl font-bold">{s.title}</h3>
              <p className="m-0 text-base leading-[1.55] text-on-navy">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Visit({ d, business }: { d: Dict; business: Business }) {
  const v = d.visit;
  const telUrl = `tel:${business.phone.tel}`;
  return (
    <section id="visit">
      <div className="container-x section-y flex flex-wrap gap-10">
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-5">
          <h2 className="h2">{v.title}</h2>
          <address className="flex flex-col gap-3.5 text-[17px] leading-normal not-italic">
            <div>
              <strong>{v.addressLabel}</strong>
              <br />
              {v.address}
            </div>
            <div>
              <strong>{v.hoursLabel}</strong>
              <br />
              {v.hours}
            </div>
            <div>
              <strong>{v.phoneLabel}</strong>
              <br />
              <a href={telUrl}>{business.phone.display}</a>
            </div>
            <div>
              <strong>{v.emailLabel}</strong>
              <br />
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </div>
          </address>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappUrl(business.phone.whatsapp)} target="_blank" rel="noopener" className="btn-wa">
              {v.whatsapp}
            </a>
            <a href={telUrl} className="btn-outline">
              {v.call}
            </a>
            <a href={business.directionsUrl} target="_blank" rel="noopener" className="btn-outline">
              {v.directions}
            </a>
          </div>
        </div>
        {business.mapsEmbedUrl && (
          <iframe
            src={business.mapsEmbedUrl}
            title={v.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[340px] min-w-0 flex-[1_1_420px] rounded-photo border-0"
          />
        )}
      </div>
    </section>
  );
}
