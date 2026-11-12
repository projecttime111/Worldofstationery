import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextRow } from "@/components/admin/TextRow";
import { requireAdmin } from "@/lib/admin/auth";
import { flattenTexts, sectionName, textLabel, textSections } from "@/lib/admin/texts";
import { asAdmin } from "@/lib/db";
import { bundledDicts, locales, type Locale } from "@/lib/i18n";
import { saveTexts } from "../actions";

export const metadata: Metadata = { title: "Site text" };

export default async function TextsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const admin = await requireAdmin();
  const sections = textSections(bundledDicts.en);
  const requested = (await searchParams).section ?? "";
  const section = sections.includes(requested) ? requested : "hero";

  const [overrides] = await asAdmin(admin.email, (tx) => [
    tx`select locale, path, value from public.text_overrides where path like ${`${section}.%`}`,
  ]);
  const edited = new Map(overrides.map((o) => [`${o.locale}:${o.path}`, String(o.value)]));
  const original = Object.fromEntries(
    locales.map((l) => [l, new Map(flattenTexts(bundledDicts[l]).map((t) => [t.path, t.value]))]),
  ) as Record<Locale, Map<string, string>>;
  const entries = flattenTexts((bundledDicts.en as Record<string, unknown>)[section], section);

  return (
    <>
      <PageHeader title="Site text">
        <p className="m-0">
          Every word on the website, in all three languages. Saving a text that matches the original puts the original back. Hindi and
          Marathi are draft translations until a native speaker has checked them.
        </p>
      </PageHeader>

      <nav aria-label="Text sections" className="mb-5 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="m-0 flex list-none gap-2 p-0 md:flex-wrap">
          {sections.map((s) => (
            <li key={s} className="shrink-0">
              <a
                href={`/admin/texts/?section=${s}`}
                aria-current={s === section ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-semibold whitespace-nowrap no-underline ${
                  s === section ? "border-navy bg-navy text-white hover:text-white" : "border-line bg-white text-ink"
                }`}
              >
                {sectionName(s)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ActionForm action={saveTexts} submit="Save and publish" className="admin-card">
        <input type="hidden" name="section" value={section} />
        <h2 className="m-0 text-lg font-bold">{sectionName(section)}</h2>
        {entries.map(({ path }) => {
          const values = Object.fromEntries(
            locales.map((l) => [l, edited.get(`${l}:${path}`) ?? original[l].get(path) ?? ""]),
          ) as Record<Locale, string>;
          const changed = locales.some((l) => edited.has(`${l}:${path}`));
          return <TextRow key={path} path={path} label={textLabel(path) || sectionName(section)} values={values} changed={changed} />;
        })}
      </ActionForm>
    </>
  );
}
