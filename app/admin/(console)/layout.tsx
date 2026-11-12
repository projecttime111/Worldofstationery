import Link from "next/link";
import { SideNav, TabBar, type NavItem } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/LogoMark";
import { requireAdmin } from "@/lib/admin/auth";
import { signOutAction } from "../auth-actions";

const ICONS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  shop: "M4 4h16v4H4zM5 8v12h14V8M9 12h6",
  offer: "M20 12l-8 8-9-9V3h8zM7.5 7.5h.01",
  brand: "M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z",
  text: "M4 6h16M4 12h10M4 18h13",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8",
  history: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const owner = admin.role === "owner";

  const items: NavItem[] = [
    { href: "/admin/", label: "Dashboard", short: "Home", icon: ICONS.home },
    { href: "/admin/business/", label: "Business details", short: "Business", icon: ICONS.shop },
    { href: "/admin/offers/", label: "Offers", short: "Offers", icon: ICONS.offer },
    { href: "/admin/brands/", label: "Brands and catalogues", short: "Brands", icon: ICONS.brand },
    { href: "/admin/texts/", label: "Site text", short: "Text", icon: ICONS.text },
    ...(owner
      ? [
          { href: "/admin/users/", label: "Admin users", short: "Admins", icon: ICONS.users },
          { href: "/admin/history/", label: "Change history", short: "History", icon: ICONS.history },
        ]
      : []),
  ];
  // Phones: the four most used sections, plus "More" for everything else.
  const tabs: NavItem[] = [...items.slice(0, 4), { href: "/admin/more/", label: "More", short: "More", icon: ICONS.more }];

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-white md:flex md:min-h-dvh md:flex-col md:gap-6 md:p-4">
        <Link href="/admin/" className="flex items-center gap-2.5 px-2 pt-1 text-ink no-underline">
          <LogoMark id="admin-side" size={36} />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-muted">World of Stationery</span>
            <span className="font-heading text-lg font-extrabold text-navy">Admin</span>
          </span>
        </Link>
        <nav aria-label="Admin sections">
          <SideNav items={items} />
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-line px-2 pt-4 text-sm">
          <span className="font-semibold break-all">{admin.displayName || admin.email}</span>
          <span className="text-muted capitalize">{admin.role}</span>
          <div className="flex flex-wrap gap-x-4">
            <a href="/en/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-semibold">
              View site
            </a>
            <form action={signOutAction}>
              <button type="submit" className="min-h-11 cursor-pointer font-semibold text-navy underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5 md:hidden">
          <Link href="/admin/" className="flex items-center gap-2 font-heading text-lg font-extrabold text-navy no-underline">
            <LogoMark id="admin-top" size={30} />
            Admin
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="min-h-11 cursor-pointer text-sm font-semibold text-navy underline">
              Sign out
            </button>
          </form>
        </header>
        <main className="mx-auto w-full max-w-[1000px] px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">{children}</main>
      </div>

      <nav aria-label="Admin sections" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden">
        <TabBar items={tabs} />
      </nav>
    </div>
  );
}
