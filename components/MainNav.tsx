"use client";

import { useEffect, useId, useRef, useState } from "react";

type NavItem = { href: string; label: string };

/**
 * Desktop: inline links plus the WhatsApp button.
 * Phones and tablets: a menu button that opens the same links.
 */
export function MainNav({
  items,
  whatsapp,
  navLabel,
  openLabel,
}: {
  items: NavItem[];
  whatsapp: NavItem;
  navLabel: string;
  openLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav aria-label={navLabel} className="flex items-center gap-3">
      {/* Desktop */}
      <ul className="m-0 hidden list-none items-center gap-[22px] p-0 text-[15px] font-medium lg:flex">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="inline-flex min-h-11 items-center text-ink no-underline hover:text-navy hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noopener"
        className="hidden min-h-11 items-center rounded-pill bg-wa px-[18px] text-[15px] font-semibold text-white no-underline hover:text-white hover:brightness-90 sm:inline-flex"
      >
        {whatsapp.label}
      </a>

      {/* Phones and tablets */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-pill border-2 border-navy px-4 text-[15px] font-semibold text-navy lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </svg>
        {openLabel}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 border-b border-line bg-white shadow-lg lg:hidden"
      >
        <ul className="container-x m-0 flex list-none flex-col py-3">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-line text-[17px] font-medium text-ink no-underline"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <a href={whatsapp.href} target="_blank" rel="noopener" className="btn-wa w-full">
              {whatsapp.label}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
