import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { asAdmin } from "@/lib/db";
import { saveBusiness } from "../actions";

export const metadata: Metadata = { title: "Business details" };

const DAYS: [string, string][] = [
  ["Mo", "Mon"],
  ["Tu", "Tue"],
  ["We", "Wed"],
  ["Th", "Thu"],
  ["Fr", "Fri"],
  ["Sa", "Sat"],
  ["Su", "Sun"],
];

export default async function BusinessPage() {
  const admin = await requireAdmin();
  const [[b]] = await asAdmin(admin.email, (tx) => [tx`select * from public.business where id = 1`]);
  const v = (k: string) => (b?.[k] == null ? "" : String(b[k]));
  const days = (b?.opening_days as string[]) ?? [];

  const input = (name: string, label: string, hint?: string, type = "text") => (
    <Field label={label} hint={hint}>
      <input name={name} type={type} defaultValue={v(name)} className="admin-input" />
    </Field>
  );

  return (
    <>
      <PageHeader title="Business details">
        <p className="m-0">
          Used in the header, footer, Visit section, every WhatsApp and call button, and Google&apos;s business information.
          The opening hours <em>text</em> shown on the site is under Site text → Visit us.
        </p>
      </PageHeader>
      <ActionForm action={saveBusiness} submit="Save and publish" className="admin-card">
        <h2 className="m-0 text-lg font-bold">Phone and email</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("phone_display", "Phone as shown", "e.g. 8999126686")}
          {input("phone_international", "Phone, international format", "e.g. +91 89991 26686")}
          {input("phone_tel", "Phone for the call button", "+ and digits only, e.g. +918999126686")}
          {input("phone_whatsapp", "WhatsApp number", "digits only with 91, e.g. 918999126686")}
          {input("email", "Email", undefined, "email")}
          {input("gstin", "GSTIN")}
        </div>

        <h2 className="m-0 mt-2 text-lg font-bold">Address and map</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("street", "Street")}
          {input("locality", "City")}
          {input("region", "State")}
          {input("postal_code", "PIN code")}
          {input("directions_url", "Directions link", "The Google Maps share link")}
          {input("maps_embed_url", "Map embed address", "From Google Maps → Share → Embed a map: only the src=\"…\" part. Empty hides the map.")}
          {input("latitude", "Latitude (optional)", "For Google; leave empty if unsure")}
          {input("longitude", "Longitude (optional)")}
        </div>

        <h2 className="m-0 mt-2 text-lg font-bold">Opening hours (for Google)</h2>
        <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
          <legend className="mb-1.5 font-semibold">Open on</legend>
          {DAYS.map(([code, label]) => (
            <label key={code} className="flex min-h-11 items-center gap-2 rounded-pill border border-line bg-white px-3.5">
              <input type="checkbox" name="days" value={code} defaultChecked={days.includes(code)} className="size-4" />
              {label}
            </label>
          ))}
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          {input("opens", "Opens", "24-hour, e.g. 09:00")}
          {input("closes", "Closes", "24-hour, e.g. 20:00")}
          {input("years_experience", "Years in business", undefined, "number")}
        </div>

        <h2 className="m-0 mt-2 text-lg font-bold">Social links</h2>
        <p className="-mt-2 m-0 text-sm text-muted">Leave empty to hide the icon. Must start with https://</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {input("instagram_url", "Instagram")}
          {input("facebook_url", "Facebook")}
          {input("youtube_url", "YouTube")}
        </div>
      </ActionForm>
    </>
  );
}
