"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n";

/** Section ids on the page, used to keep the reader's place when the language changes. */
function currentSectionHash(): string {
  if (window.location.hash) return window.location.hash;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
  let current = "";
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= 120) current = s.id;
  }
  return current && window.scrollY > 200 ? `#${current}` : "";
}

export function LanguageSwitcher({ current, groupLabel }: { current: Locale; groupLabel: string }) {
  const pathname = usePathname() || `/${current}/`;

  // After switching language the new page opens at #section; make sure we land there.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    // Wait for web fonts so the section does not move after we scroll to it.
    document.fonts.ready.then(() => el.scrollIntoView({ block: "start", behavior: "instant" }));
  }, []);

  const go = (target: Locale) => {
    if (target === current) return;
    const rest = pathname.replace(/^\/(en|hi|mr)(?=\/|$)/, "");
    const path = `/${target}${rest || "/"}`;
    // A full page load on purpose: the new page arrives with its own <html lang>,
    // fonts and hreflang links exactly as search engines and screen readers see them.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(path + currentSectionHash());
  };

  return (
    <div role="group" aria-label={groupLabel} className="flex gap-1">
      {locales.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            onClick={() => go(l)}
            className={
              active
                ? "min-h-11 rounded-pill bg-yellow px-3 text-[13px] font-bold text-ink"
                : "min-h-11 rounded-pill border border-navy-pill bg-transparent px-3 text-sm font-semibold text-white hover:bg-white/10"
            }
          >
            {localeLabels[l]}
          </button>
        );
      })}
    </div>
  );
}
