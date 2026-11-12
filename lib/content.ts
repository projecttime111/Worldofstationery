import "server-only";
import { unstable_cache } from "next/cache";
import { business as seedBusiness, type Business } from "@/content/business";
import seedCatalogues from "@/content/catalogues.json";
import seedOffers from "@/content/offers.json";
import { categoryImages as seedCategoryImages, type CardImage } from "@/content/photos";
import { contentFromRows, type ContentRows } from "./content-rows";
import { bundledDicts, type Dict, type Locale } from "./i18n";
import { asVisitor, databaseConfigured } from "./db";

/**
 * Everything the public pages show, in one object.
 *
 * With the database set up (DATABASE_URL), it is read from Neon Postgres (one cached read,
 * refreshed when an admin publishes: see CONTENT_TAG). Without a database, or if it cannot be
 * reached, the bundled files in content/ are used, so the site never breaks.
 */

export type Catalogue = {
  slug: string;
  name: string;
  logo: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  categories: Record<Locale, string>;
  pdf: string | null;
  updated: string | null;
};

export type Offers = Omit<typeof seedOffers, "_note">;

export type SiteContent = {
  business: Business;
  catalogues: Catalogue[];
  offers: Offers;
  categoryImages: CardImage[];
  dicts: Record<Locale, Dict>;
  /** Where the content came from, shown in the admin: the database, or the bundled files. */
  source: "database" | "files";
};

/** Cache tag for all public content. Admin saves call updateTag/revalidateTag with it. */
export const CONTENT_TAG = "content";

function offersFromFile(): Offers {
  const { _note, ...rest } = seedOffers;
  void _note;
  return rest;
}

export const fallbackContent: SiteContent = {
  business: seedBusiness,
  catalogues: seedCatalogues.brands as Catalogue[],
  offers: offersFromFile(),
  categoryImages: seedCategoryImages,
  dicts: bundledDicts,
  source: "files",
};

export async function getContent(): Promise<SiteContent> {
  if (!databaseConfigured()) return fallbackContent;
  try {
    return await cachedContent();
  } catch (error) {
    console.error("[content] database unavailable, using the bundled content files:", error);
    return fallbackContent;
  }
}

/** Content plus the dictionary for one language. */
export async function getPageContent(locale: Locale) {
  const content = await getContent();
  return { ...content, d: content.dicts[locale] };
}

const cachedContent = unstable_cache(loadFromDatabase, ["site-content", "v1"], { tags: [CONTENT_TAG] });

async function loadFromDatabase(): Promise<SiteContent> {
  const [business, brands, offers, categories, texts] = await asVisitor((tx) => [
    tx`select * from public.business where id = 1`,
    tx`select * from public.brands order by position`,
    tx`select * from public.offers where id = 1`,
    tx`select slug, position, image_src, image_width, image_height from public.categories order by position`,
    tx`select locale, path, value from public.text_overrides`,
  ]);
  return contentFromRows(
    { business: business[0] ?? null, brands, offers: offers[0] ?? null, categories, texts } as ContentRows,
    fallbackContent,
  );
}
