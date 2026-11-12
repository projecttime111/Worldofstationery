import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, PageHeader } from "@/components/admin/PageHeader";
import { BrandLogo } from "@/components/BrandTile";
import { requireAdmin } from "@/lib/admin/auth";
import { asAdmin } from "@/lib/db";
import { addBrand, deleteBrand, saveBrand } from "../actions";

export const metadata: Metadata = { title: "Brands and catalogues" };

const PLACEMENTS: [string, string][] = [
  ["key", "Key partner (top of the pyramid)"],
  ["row2", "Authorised, row 2"],
  ["row3", "Authorised, row 3"],
  ["also", "We also deal in"],
  ["hidden", "Hidden"],
];

function PlacementSelect({ value }: { value?: string }) {
  return (
    <select name="placement" defaultValue={value ?? "also"} className="admin-input">
      {PLACEMENTS.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default async function BrandsPage() {
  const admin = await requireAdmin();
  const [brands] = await asAdmin(admin.email, (tx) => [
    tx`select * from public.brands
       order by array_position(array['key','row2','row3','also','hidden'], placement), position`,
  ]);

  return (
    <>
      <PageHeader title="Brands and catalogues">
        <p className="m-0">
          Where each brand sits in the pyramid, the order within its row (smaller number first), and what each brand supplies. Uploading
          logos and catalogue PDFs is coming in a later phase; until then a brand without a logo shows its name.
        </p>
      </PageHeader>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {brands.map((b) => {
          const s = (k: string) => (b[k] == null ? "" : String(b[k]));
          return (
            <li key={s("slug")} className="admin-card">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-tile border border-line bg-white">
                  <BrandLogo
                    brand={{
                      name: s("name"),
                      logo: (b.logo_path as string) ?? null,
                      width: (b.logo_width as number) ?? undefined,
                      height: (b.logo_height as number) ?? undefined,
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="m-0 text-xl font-bold">{s("name")}</h2>
                  <p className="m-0 text-sm text-muted">
                    {s("catalogue_pdf") ? "Catalogue PDF online" : "No catalogue PDF yet (visitors can request it on WhatsApp)"}
                  </p>
                </div>
              </div>
              <ActionForm action={saveBrand} submit={`Save ${s("name")}`}>
                <input type="hidden" name="slug" value={s("slug")} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Name">
                    <input name="name" defaultValue={s("name")} required className="admin-input" />
                  </Field>
                  <Field label="Shown in">
                    <PlacementSelect value={s("placement")} />
                  </Field>
                  <Field label="Order in its row">
                    <input name="position" type="number" defaultValue={s("position")} className="admin-input" />
                  </Field>
                </div>
                <Field label="Catalogue updated" hint="Month and year shown on the catalogue card, e.g. November 2026">
                  <input name="catalogue_updated" defaultValue={s("catalogue_updated")} className="admin-input sm:max-w-[320px]" />
                </Field>
                <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                  <legend className="mb-1 font-semibold">What this brand supplies (empty = not shown)</legend>
                  <div className="grid gap-3 lg:grid-cols-3">
                    <Field label="English">
                      <input name="supplies_en" defaultValue={s("supplies_en")} className="admin-input" />
                    </Field>
                    <Field label="हिंदी">
                      <input name="supplies_hi" lang="hi" defaultValue={s("supplies_hi")} className="admin-input" />
                    </Field>
                    <Field label="मराठी">
                      <input name="supplies_mr" lang="mr" defaultValue={s("supplies_mr")} className="admin-input" />
                    </Field>
                  </div>
                </fieldset>
              </ActionForm>
              {s("placement") !== "key" && (
                <details className="mt-3">
                  <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-error">Remove this brand</summary>
                  <ActionForm action={deleteBrand} submit={`Remove ${s("name")}`} danger confirm={`Remove ${s("name")} from the website?`} className="mt-2">
                    <input type="hidden" name="slug" value={s("slug")} />
                  </ActionForm>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      <section className="admin-card mt-6">
        <h2 className="m-0 mb-3 text-lg font-bold">Add a brand</h2>
        <ActionForm action={addBrand} submit="Add brand">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input name="name" required className="admin-input" />
            </Field>
            <Field label="Short web name" hint="lowercase-with-dashes, e.g. kangaro">
              <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className="admin-input" />
            </Field>
            <Field label="Shown in">
              <PlacementSelect />
            </Field>
          </div>
        </ActionForm>
      </section>
    </>
  );
}
