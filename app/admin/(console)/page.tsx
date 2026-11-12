import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { getContent } from "@/lib/content";
import { asAdmin } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

const when = (v: unknown) =>
  new Date(String(v)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export default async function Dashboard() {
  const admin = await requireAdmin();
  const owner = admin.role === "owner";
  const [counts, recent] = await asAdmin(admin.email, (tx) => [
    tx`select
         (select count(*)::int from public.brands where placement <> 'hidden') as brands,
         (select count(*)::int from public.brands where catalogue_pdf is not null) as pdfs,
         (select count(*)::int from public.text_overrides) as texts,
         (select enabled from public.offers where id = 1) as offers_on`,
    tx`select at, actor, table_name, row_key, action from public.audit_log
       where actor <> 'system' order by at desc limit 6`,
  ]);
  const c = counts[0] ?? {};
  const content = await getContent();

  const cards = [
    { label: "Brands shown", value: String(c.brands ?? "–"), href: "/admin/brands/" },
    { label: "Catalogue PDFs", value: String(c.pdfs ?? "–"), href: "/admin/brands/" },
    { label: "Texts changed", value: String(c.texts ?? "–"), href: "/admin/texts/" },
    { label: "Offers section", value: c.offers_on ? "On" : "Off", href: "/admin/offers/" },
  ];

  return (
    <>
      <PageHeader title={`Hello${admin.displayName ? `, ${admin.displayName}` : ""}`}>
        <p className="m-0">
          Changes you save here go live on the website within a few seconds.{" "}
          {content.source === "database" ? (
            <span className="font-semibold text-wa">The site is reading from the database.</span>
          ) : (
            <span className="font-semibold text-error">The site could not reach the database and is showing the built-in content.</span>
          )}
        </p>
      </PageHeader>

      <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <a href={card.href} className="admin-card flex flex-col gap-1 text-ink no-underline hover:border-navy">
              <span className="font-heading text-[34px] leading-none font-extrabold text-navy">{card.value}</span>
              <span className="text-sm font-semibold text-muted">{card.label}</span>
            </a>
          </li>
        ))}
      </ul>

      {owner && (
        <section className="admin-card mt-6">
          <h2 className="m-0 mb-3 text-lg font-bold">Recent changes</h2>
          {recent.length ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              {recent.map((r, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-x-4 border-b border-line pb-2 last:border-0">
                  <span>
                    <strong>{String(r.actor)}</strong> {String(r.action)}d {String(r.table_name).replace("_", " ")}{" "}
                    <span className="text-muted">{String(r.row_key)}</span>
                  </span>
                  <span className="text-muted">{when(r.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-muted">No changes yet.</p>
          )}
          <Link href="/admin/history/" className="mt-3 inline-flex min-h-11 items-center font-semibold">
            Full change history
          </Link>
        </section>
      )}

      <section className="admin-card mt-6">
        <h2 className="m-0 mb-2 text-lg font-bold">Coming next</h2>
        <p className="m-0 text-[15px] text-body">
          Quotation requests with uploaded lists, the enquiries inbox, visitor numbers and charts, logo and catalogue PDF uploads,
          and collections are being added in the next phases of round 3.
        </p>
      </section>
    </>
  );
}
