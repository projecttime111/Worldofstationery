import type { MetadataRoute } from "next";
import { business } from "@/content/business";
import { locales, localePath } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "bulk", "catalogues"] as const;
  return pages.flatMap((page) =>
    locales.map((l) => ({
      url: `${business.siteUrl}${localePath(l, page)}`,
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((x) => [`${x}-IN`, `${business.siteUrl}${localePath(x, page)}`])),
      },
    })),
  );
}
