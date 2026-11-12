"use client";

import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; short: string; icon: string };

const isActive = (pathname: string, href: string) =>
  href === "/admin/" ? pathname === "/admin/" || pathname === "/admin" : pathname.startsWith(href);

/** Sidebar links on desktop. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold no-underline ${
                active ? "bg-navy text-white hover:text-white" : "text-ink hover:bg-paper"
              }`}
            >
              <Icon d={item.icon} />
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Bottom tab bar on phones. */
export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold no-underline ${
                active ? "text-navy" : "text-muted"
              }`}
            >
              <Icon d={item.icon} />
              {item.short}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
