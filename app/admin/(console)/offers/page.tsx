import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { asAdmin } from "@/lib/db";
import { saveOffers } from "../actions";

export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage() {
  const admin = await requireAdmin();
  const [[o]] = await asAdmin(admin.email, (tx) => [tx`select * from public.offers where id = 1`]);
  const v = (k: string) => (o?.[k] == null ? "" : String(o[k]));
  const num = (name: string, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input name={name} type="number" min={0} inputMode="numeric" defaultValue={v(name)} className="admin-input" />
    </Field>
  );

  return (
    <>
      <PageHeader title="Offers">
        <p className="m-0">
          The Offers section on the home page and its menu link appear only while this is switched on. The wording around these
          numbers is under Site text → Offers.
        </p>
      </PageHeader>
      <ActionForm action={saveOffers} submit="Save and publish" className="admin-card">
        <label className="flex min-h-11 items-center gap-3 text-lg font-bold">
          <input type="checkbox" name="enabled" defaultChecked={Boolean(o?.enabled)} className="size-5" />
          Show the Offers section on the website
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts" hint="As it should appear, e.g. 1 December 2026">
            <input name="start_date" defaultValue={v("start_date")} className="admin-input" />
          </Field>
          <Field label="Ends" hint="e.g. 31 January 2027">
            <input name="end_date" defaultValue={v("end_date")} className="admin-input" />
          </Field>
        </div>
        <h2 className="m-0 mt-2 text-lg font-bold">Discount on the bill</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {num("bill_tier1_min", "Tier 1: bill of at least ₹")}
          {num("bill_tier1_percent", "Tier 1: % off")}
          {num("bill_tier2_min", "Tier 2: bill of at least ₹")}
          {num("bill_tier2_percent", "Tier 2: % off")}
          {num("gift_pack_value", "Gift pack value ₹", "Given with tier 2")}
        </div>
        <h2 className="m-0 mt-2 text-lg font-bold">Refer a friend</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {num("refer_friend_saves", "Friend saves ₹")}
          {num("refer_you_earn", "You earn ₹")}
          {num("refer_min_first_bill", "Friend's first bill at least ₹")}
        </div>
        <h2 className="m-0 mt-2 text-lg font-bold">Gold customer</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {num("gold_visits", "Visits")}
          {num("gold_yearly_spend", "Yearly spend ₹")}
          {num("gold_extra_percent", "Extra % off")}
        </div>
      </ActionForm>
    </>
  );
}
