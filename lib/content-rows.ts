// Turns database rows into the shapes the pages use.
// Pure functions with type-only imports, so they can be tested without Next.js or a database.
import type { Brand } from "@/content/business";
import type { Dict, Locale } from "./i18n";
import type { SiteContent } from "./content";

const LOCALES: Locale[] = ["en", "hi", "mr"];

export type BusinessRow = {
  phone_display: string;
  phone_international: string;
  phone_tel: string;
  phone_whatsapp: string;
  email: string;
  gstin: string;
  street: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
  latitude: number | string | null;
  longitude: number | string | null;
  directions_url: string;
  maps_embed_url: string | null;
  opening_days: string[];
  opens: string;
  closes: string;
  years_experience: number;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
};

export type BrandRow = {
  slug: string;
  name: string;
  logo_path: string | null;
  logo_width: number | null;
  logo_height: number | null;
  placement: "key" | "row2" | "row3" | "also" | "hidden";
  position: number;
  catalogue_pdf: string | null;
  catalogue_updated: string | null;
  supplies_en: string;
  supplies_hi: string;
  supplies_mr: string;
};

export type OffersRow = {
  enabled: boolean;
  start_date: string;
  end_date: string;
  bill_tier1_min: number;
  bill_tier1_percent: number;
  bill_tier2_min: number;
  bill_tier2_percent: number;
  gift_pack_value: number;
  refer_friend_saves: number;
  refer_you_earn: number;
  refer_min_first_bill: number;
  gold_visits: number;
  gold_yearly_spend: number;
  gold_extra_percent: number;
};

export type CategoryRow = { slug: string; position: number; image_src: string; image_width: number; image_height: number };
export type TextRow = { locale: Locale; path: string; value: string };

export type ContentRows = {
  business: BusinessRow | null;
  brands: BrandRow[] | null;
  offers: OffersRow | null;
  categories: CategoryRow[] | null;
  texts: TextRow[] | null;
};

/** `seed` is the bundled content: it supplies the fixed facts (store name, site address) and the texts. */
export function contentFromRows(rows: ContentRows, seed: SiteContent): SiteContent {
  const b = rows.business;
  const o = rows.offers;
  const brandRows = [...(rows.brands ?? [])].sort((x, y) => x.position - y.position);
  const categoryRows = [...(rows.categories ?? [])].sort((x, y) => x.position - y.position);
  const textRows = rows.texts ?? [];
  if (!b || !o || !brandRows.length) throw new Error("content tables are empty (run supabase/seed.sql)");

  const toBrand = (r: BrandRow): Brand => ({
    slug: r.slug,
    name: r.name,
    logo: r.logo_path,
    ...(r.logo_width && r.logo_height ? { width: r.logo_width, height: r.logo_height } : {}),
  });
  const placed = (p: BrandRow["placement"]) => brandRows.filter((r) => r.placement === p);
  const key = placed("key")[0] ?? brandRows.find((r) => r.placement !== "hidden") ?? brandRows[0];
  const others = (p: BrandRow["placement"]) => placed(p).filter((r) => r.slug !== key.slug);
  // Catalogues follow the pyramid order: key partner, row 2, row 3, then "also deal in".
  const ordered = [key, ...others("row2"), ...others("row3"), ...others("also")];

  const dicts = Object.fromEntries(
    LOCALES.map((l) => [l, applyTextOverrides(seed.dicts[l], textRows.filter((t) => t.locale === l))]),
  ) as Record<Locale, Dict>;

  return {
    source: "database",
    business: {
      ...seed.business,
      yearsExperience: b.years_experience,
      phone: { display: b.phone_display, international: b.phone_international, tel: b.phone_tel, whatsapp: b.phone_whatsapp },
      email: b.email,
      gstin: b.gstin,
      address: { street: b.street, locality: b.locality, region: b.region, postalCode: b.postal_code, country: b.country },
      geo: b.latitude != null && b.longitude != null ? { latitude: Number(b.latitude), longitude: Number(b.longitude) } : null,
      directionsUrl: b.directions_url,
      mapsEmbedUrl: b.maps_embed_url || null,
      openingHours: { days: b.opening_days, opens: b.opens, closes: b.closes },
      socials: { instagram: b.instagram_url, facebook: b.facebook_url, youtube: b.youtube_url },
      keyPartner: toBrand(key),
      authorisedBrands: { row2: others("row2").map(toBrand), row3: others("row3").map(toBrand) },
      alsoDealIn: others("also").map(toBrand),
    },
    catalogues: ordered.map((r) => ({
      slug: r.slug,
      name: r.name,
      logo: r.logo_path,
      logoWidth: r.logo_width,
      logoHeight: r.logo_height,
      categories: { en: r.supplies_en, hi: r.supplies_hi, mr: r.supplies_mr },
      pdf: r.catalogue_pdf,
      updated: r.catalogue_updated,
    })),
    offers: {
      enabled: o.enabled,
      startDate: o.start_date,
      endDate: o.end_date,
      billTier1Min: o.bill_tier1_min,
      billTier1Percent: o.bill_tier1_percent,
      billTier2Min: o.bill_tier2_min,
      billTier2Percent: o.bill_tier2_percent,
      giftPackValue: o.gift_pack_value,
      referFriendSaves: o.refer_friend_saves,
      referYouEarn: o.refer_you_earn,
      referMinFirstBill: o.refer_min_first_bill,
      goldVisits: o.gold_visits,
      goldYearlySpend: o.gold_yearly_spend,
      goldExtraPercent: o.gold_extra_percent,
    },
    categoryImages: categoryRows.length
      ? categoryRows.map((c) => ({ src: c.image_src, width: c.image_width, height: c.image_height }))
      : seed.categoryImages,
    dicts,
  };
}

/**
 * Site text lives in content/<lang>.json. The admin stores only the texts it changes,
 * as (locale, path, value) rows, for example ("hi", "hero.title", "...").
 * A row is applied only where the path already holds text in the file, so an old or
 * mistyped row can never break a page, and new texts added to the files show up as written.
 */
export function applyTextOverrides(dict: Dict, rows: { path: string; value: string }[]): Dict {
  if (!rows.length) return dict;
  const copy = structuredClone(dict) as unknown as Record<string, unknown>;
  for (const { path, value } of rows) {
    const keys = path.split(".");
    let node: unknown = copy;
    for (const k of keys.slice(0, -1)) {
      node = node && typeof node === "object" ? (node as Record<string, unknown>)[k] : undefined;
    }
    const last = keys.at(-1)!;
    if (node && typeof node === "object" && typeof (node as Record<string, unknown>)[last] === "string") {
      (node as Record<string, unknown>)[last] = value;
    }
  }
  return copy as unknown as Dict;
}
