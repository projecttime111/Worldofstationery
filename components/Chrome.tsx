import { whatsappUrl, type Business } from "@/content/business";
import { fmt, localePath, type Dict, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoMark, YamunaMark } from "./LogoMark";
import { MainNav } from "./MainNav";

export function SkipLink({ dict }: { dict: Dict }) {
  return (
    <a
      href="#main"
      className="sr-only rounded-pill bg-yellow px-4 py-3 font-semibold text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]"
    >
      {dict.a11y.skipToContent}
    </a>
  );
}

export function TopBar({ dict, locale, business }: { dict: Dict; locale: Locale; business: Business }) {
  return (
    <div className="on-dark bg-navy text-sm text-white">
      <div className="container-x flex items-center justify-between gap-2 py-1.5">
        <span className="min-w-0">
          <span className="hidden sm:inline">{dict.topbar.callPrefix} </span>
          <a
            href={`tel:${business.phone.tel}`}
            className="inline-flex min-h-11 items-center font-bold text-white no-underline hover:text-white hover:underline sm:min-h-0"
          >
            {business.phone.display}
          </a>
          <span className="hidden md:inline"> · {dict.topbar.hoursShort}</span>
        </span>
        <LanguageSwitcher current={locale} groupLabel={dict.a11y.languageGroup} />
      </div>
    </div>
  );
}

export function Header({
  dict,
  locale,
  onHome,
  business,
  offersEnabled,
}: {
  dict: Dict;
  locale: Locale;
  onHome: boolean;
  business: Business;
  offersEnabled: boolean;
}) {
  const home = localePath(locale);
  const anchor = (id: string) => (onHome ? `#${id}` : `${home}#${id}`);
  const nav = dict.header.nav;
  const items = [
    { href: anchor("products"), label: nav.products },
    { href: anchor("brands"), label: nav.brands },
    { href: localePath(locale, "catalogues"), label: nav.catalogues },
    ...(offersEnabled ? [{ href: anchor("offers"), label: nav.offers }] : []),
    { href: anchor("about"), label: nav.about },
    { href: localePath(locale, "bulk"), label: nav.bulk },
  ];

  return (
    <header className="relative border-b border-line bg-white">
      <div className="container-x flex items-center justify-between gap-4 py-3.5">
        <a href={home} className="flex items-center gap-3 text-ink no-underline hover:text-ink">
          <LogoMark id="header" size={52} />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-semibold text-muted">{dict.header.worldOf}</span>
            <span className="font-heading text-[22px] font-extrabold tracking-[0.02em] text-navy sm:text-[26px]">
              {dict.header.stationery}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <YamunaMark size={18} />
              {dict.header.byLine}
            </span>
          </span>
        </a>
        <MainNav
          items={items}
          whatsapp={{ href: whatsappUrl(business.phone.whatsapp), label: dict.header.whatsapp }}
          navLabel={dict.a11y.mainNav}
          openLabel={dict.a11y.openMenu}
        />
      </div>
    </header>
  );
}

export function Footer({ dict, locale, business }: { dict: Dict; locale: Locale; business: Business }) {
  const nav = dict.header.nav;
  const links = [
    { href: `${localePath(locale)}#products`, label: nav.products },
    { href: localePath(locale, "catalogues"), label: nav.catalogues },
    { href: localePath(locale, "bulk"), label: nav.bulk },
  ];
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <YamunaMark size={40} />
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg leading-none font-extrabold tracking-[0.04em] text-ink">{dict.footer.parentName}</span>
              <span className="text-sm text-muted">{dict.footer.parentLine}</span>
            </div>
          </div>
          <nav aria-label={dict.footer.navLabel}>
            <ul className="m-0 flex list-none flex-wrap gap-x-5 p-0 text-[15px] font-semibold">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-flex min-h-11 items-center">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-sm text-muted">
          <span>{fmt(dict.footer.legal, { year: new Date().getFullYear().toString(), gstin: business.gstin })}</span>
          <span>
            {dict.footer.brandsNote} {dict.footer.messagingNote}
          </span>
        </div>
      </div>
    </footer>
  );
}
