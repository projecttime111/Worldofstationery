"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import type { ActionState } from "@/components/admin/ActionForm";
import { newSetupLink, requireAdmin, requireOwner } from "@/lib/admin/auth";
import { flattenTexts } from "@/lib/admin/texts";
import { CONTENT_TAG } from "@/lib/content";
import { asAdmin } from "@/lib/db";
import { bundledDicts, locales } from "@/lib/i18n";

// ── helpers ────────────────────────────────────────────────────────────────

/** Make the public pages show the change now, and refresh the console's own lists. */
function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath("/[lang]", "layout");
  refreshConsole();
}

/** Re-render the console pages (lists of brands, admins, history) after a change. */
function refreshConsole() {
  revalidatePath("/admin", "layout");
}

const ok = (message: string, link?: string): ActionState => ({ ok: true, message, ...(link ? { link } : {}) });
const fail = (message: string): ActionState => ({ ok: false, message });

function issue(error: z.ZodError) {
  const first = error.issues[0];
  return fail(`${first.path.join(" ") || "Form"}: ${first.message}`);
}

/** Database errors in plain words (check constraints carry the column name). */
function dbError(error: unknown): ActionState {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[admin]", message);
  if (/permission denied|row-level security/i.test(message)) return fail("You do not have permission to do that.");
  if (/duplicate key/i.test(message)) return fail("That already exists.");
  if (/brands_one_key_partner/.test(message)) return fail("Only one brand can be the key partner. Move the current one first.");
  if (/At least one owner/.test(message)) return fail("There must always be at least one owner.");
  const check = message.match(/check constraint "(\w+?)_(\w+)_check"/);
  if (check) return fail(`That value is not allowed for ${check[2].replace(/_/g, " ")}.`);
  return fail("Could not save. Please check the values and try again.");
}

const text = (max = 300) => z.string().trim().max(max);
const https = z.union([z.literal(""), z.string().trim().regex(/^https:\/\/\S+$/, "must start with https://")]);
const time = z.string().regex(/^[0-2]\d:[0-5]\d$/, "use 24-hour time like 09:00");
const whole = (max = 10_000_000) => z.coerce.number().int().min(0).max(max);
const optionalNumber = z.union([z.literal("").transform(() => null), z.coerce.number().min(-180).max(180)]);

// ── business details ───────────────────────────────────────────────────────

const businessSchema = z.object({
  phone_display: text(40).min(1),
  phone_international: text(40).min(1),
  phone_tel: z.string().trim().regex(/^\+\d{8,15}$/, "use + and the country code, digits only, like +918999126686"),
  phone_whatsapp: z.string().trim().regex(/^\d{8,15}$/, "digits only with the country code, like 918999126686"),
  email: z.email(),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9A-Z]{15}$/, "15 letters and digits"),
  street: text(200).min(1),
  locality: text(80).min(1),
  region: text(80).min(1),
  postal_code: text(12).min(1),
  directions_url: z.string().trim().regex(/^https:\/\/\S+$/, "must start with https://"),
  maps_embed_url: z.union([z.literal(""), z.string().trim().regex(/^https:\/\/www\.google\.com\/maps\/embed\S*$/, "must be a Google Maps embed address")]),
  latitude: optionalNumber,
  longitude: optionalNumber,
  opens: time,
  closes: time,
  years_experience: whole(200),
  instagram_url: https,
  facebook_url: https,
  youtube_url: https,
});

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export async function saveBusiness(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = businessSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const days = DAYS.filter((d) => data.getAll("days").includes(d));
  if (!days.length) return fail("Tick at least one opening day.");
  const b = parsed.data;
  try {
    await asAdmin(admin.email, (tx) => [
      tx`update public.business set
           phone_display = ${b.phone_display}, phone_international = ${b.phone_international}, phone_tel = ${b.phone_tel},
           phone_whatsapp = ${b.phone_whatsapp}, email = ${b.email.toLowerCase()}, gstin = ${b.gstin},
           street = ${b.street}, locality = ${b.locality}, region = ${b.region}, postal_code = ${b.postal_code},
           directions_url = ${b.directions_url}, maps_embed_url = ${b.maps_embed_url || null},
           latitude = ${b.latitude}, longitude = ${b.longitude},
           opening_days = ${days}, opens = ${b.opens}, closes = ${b.closes}, years_experience = ${b.years_experience},
           instagram_url = ${b.instagram_url}, facebook_url = ${b.facebook_url}, youtube_url = ${b.youtube_url}
         where id = 1`,
    ]);
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok("Saved. The website shows it now.");
}

// ── offers ─────────────────────────────────────────────────────────────────

const offersSchema = z.object({
  start_date: text(40),
  end_date: text(40),
  bill_tier1_min: whole(),
  bill_tier1_percent: whole(100),
  bill_tier2_min: whole(),
  bill_tier2_percent: whole(100),
  gift_pack_value: whole(),
  refer_friend_saves: whole(),
  refer_you_earn: whole(),
  refer_min_first_bill: whole(),
  gold_visits: whole(1000),
  gold_yearly_spend: whole(),
  gold_extra_percent: whole(100),
});

export async function saveOffers(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = offersSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const o = parsed.data;
  const enabled = data.get("enabled") === "on";
  if (enabled && (!o.start_date || !o.end_date)) return fail("Fill in both dates before switching the offers on.");
  try {
    await asAdmin(admin.email, (tx) => [
      tx`update public.offers set
           enabled = ${enabled}, start_date = ${o.start_date}, end_date = ${o.end_date},
           bill_tier1_min = ${o.bill_tier1_min}, bill_tier1_percent = ${o.bill_tier1_percent},
           bill_tier2_min = ${o.bill_tier2_min}, bill_tier2_percent = ${o.bill_tier2_percent},
           gift_pack_value = ${o.gift_pack_value}, refer_friend_saves = ${o.refer_friend_saves},
           refer_you_earn = ${o.refer_you_earn}, refer_min_first_bill = ${o.refer_min_first_bill},
           gold_visits = ${o.gold_visits}, gold_yearly_spend = ${o.gold_yearly_spend}, gold_extra_percent = ${o.gold_extra_percent}
         where id = 1`,
    ]);
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok(enabled ? "Saved. The Offers section is live." : "Saved. The Offers section stays hidden.");
}

// ── brands ─────────────────────────────────────────────────────────────────

const placement = z.enum(["key", "row2", "row3", "also", "hidden"]);
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase letters, digits and dashes, like soni-office-mate");

const brandSchema = z.object({
  slug,
  name: text(80).min(1),
  placement,
  position: z.coerce.number().int().min(0).max(100000),
  catalogue_updated: text(40),
  supplies_en: text(300),
  supplies_hi: text(300),
  supplies_mr: text(300),
});

export async function saveBrand(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = brandSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const b = parsed.data;
  try {
    const [rows] = await asAdmin(admin.email, (tx) => [
      tx`update public.brands set
           name = ${b.name}, placement = ${b.placement}, position = ${b.position},
           catalogue_updated = ${b.catalogue_updated || null},
           supplies_en = ${b.supplies_en}, supplies_hi = ${b.supplies_hi}, supplies_mr = ${b.supplies_mr}
         where slug = ${b.slug} returning slug`,
    ]);
    if (!rows.length) return fail("That brand no longer exists.");
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok(`Saved ${b.name}.`);
}

export async function addBrand(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ slug, name: text(80).min(1), placement }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const b = parsed.data;
  try {
    await asAdmin(admin.email, (tx) => [
      tx`insert into public.brands (slug, name, placement, position)
         values (${b.slug}, ${b.name}, ${b.placement}, (select coalesce(max(position), 0) + 10 from public.brands))`,
    ]);
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok(`Added ${b.name}. Its name shows until a logo is added.`);
}

export async function deleteBrand(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ slug }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  try {
    await asAdmin(admin.email, (tx) => [tx`delete from public.brands where slug = ${parsed.data.slug} and placement <> 'key'`]);
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok("Removed.");
}

// ── site text ──────────────────────────────────────────────────────────────

export async function saveTexts(_: ActionState, data: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const section = String(data.get("section") ?? "");
  const allowed = new Map(flattenTexts(bundledDicts.en).map((t) => [t.path, true]));
  const paths = data.getAll("path").map(String).filter((p) => p.startsWith(`${section}.`) && allowed.has(p));
  if (!paths.length) return fail("Nothing to save.");

  const defaults = Object.fromEntries(
    locales.map((l) => [l, new Map(flattenTexts(bundledDicts[l]).map((t) => [t.path, t.value]))]),
  );
  const upserts: { locale: string; path: string; value: string }[] = [];
  const resets: { locale: string; path: string }[] = [];
  for (const path of paths) {
    for (const locale of locales) {
      const value = String(data.get(`${locale}:${path}`) ?? "").trim();
      if (value.length > 2000) return fail("One of the texts is too long (2,000 characters at most).");
      if (!value && path.split(".")[0] !== "meta") return fail(`The ${locale.toUpperCase()} text for "${path}" is empty.`);
      if (value === (defaults[locale].get(path) ?? "").trim()) resets.push({ locale, path });
      else upserts.push({ locale, path, value });
    }
  }
  try {
    await asAdmin(admin.email, (tx) => [
      ...resets.map((r) => tx`delete from public.text_overrides where locale = ${r.locale} and path = ${r.path}`),
      ...upserts.map(
        (u) => tx`insert into public.text_overrides (locale, path, value) values (${u.locale}, ${u.path}, ${u.value})
                  on conflict (locale, path) do update set value = excluded.value
                  where public.text_overrides.value is distinct from excluded.value`,
      ),
    ]);
  } catch (e) {
    return dbError(e);
  }
  publish();
  return ok(`Saved. ${upserts.length ? `${upserts.length} text${upserts.length === 1 ? " differs" : "s differ"} from the original.` : "All texts are back to the original."}`);
}

// ── admin users (owners only) ──────────────────────────────────────────────

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const role = z.enum(["owner", "staff"]);

export async function inviteAdmin(_: ActionState, data: FormData): Promise<ActionState> {
  const owner = await requireOwner();
  const parsed = z
    .object({ email: z.email().transform((e) => e.toLowerCase()), display_name: text(60), role })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const a = parsed.data;
  const link = newSetupLink();
  try {
    await asAdmin(owner.email, (tx) => [
      tx`insert into public.admin_users (email, role, display_name, created_by, setup_token_hash, setup_expires_at)
         values (${a.email}, ${a.role}, ${a.display_name}, ${owner.email}, ${link.hash}, ${link.expires})`,
    ]);
  } catch (e) {
    return dbError(e);
  }
  refreshConsole();
  return ok(`Added ${a.email} as ${a.role}.`, `${await siteOrigin()}/admin/setup/?token=${link.token}`);
}

export async function newLinkFor(_: ActionState, data: FormData): Promise<ActionState> {
  const owner = await requireOwner();
  const email = String(data.get("email") ?? "").toLowerCase();
  const link = newSetupLink();
  try {
    const [rows] = await asAdmin(owner.email, (tx) => [
      tx`update public.admin_users set setup_token_hash = ${link.hash}, setup_expires_at = ${link.expires}
         where email = ${email} returning email`,
    ]);
    if (!rows.length) return fail("That admin no longer exists.");
  } catch (e) {
    return dbError(e);
  }
  refreshConsole();
  return ok("New setup link made. Their current password keeps working until they use it.", `${await siteOrigin()}/admin/setup/?token=${link.token}`);
}

export async function updateAdmin(_: ActionState, data: FormData): Promise<ActionState> {
  const owner = await requireOwner();
  const parsed = z
    .object({ email: z.email(), display_name: text(60), role })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success) return issue(parsed.error);
  const a = parsed.data;
  try {
    await asAdmin(owner.email, (tx) => [
      tx`update public.admin_users set role = ${a.role}, display_name = ${a.display_name} where email = ${a.email.toLowerCase()}`,
    ]);
  } catch (e) {
    return dbError(e);
  }
  refreshConsole();
  return ok("Saved.");
}

export async function removeAdmin(_: ActionState, data: FormData): Promise<ActionState> {
  const owner = await requireOwner();
  const email = String(data.get("email") ?? "").toLowerCase();
  if (email === owner.email) return fail("You cannot remove yourself. Ask another owner.");
  try {
    await asAdmin(owner.email, (tx) => [tx`delete from public.admin_users where email = ${email}`]);
  } catch (e) {
    return dbError(e);
  }
  refreshConsole();
  return ok(`Removed ${email}. They are signed out everywhere.`);
}
