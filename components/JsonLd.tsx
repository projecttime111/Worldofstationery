import type { Business } from "@/content/business";
import { htmlLang, localePath, type Locale } from "@/lib/i18n";

/** Store / LocalBusiness structured data, built only from the business details (lib/content.ts). */
export function JsonLd({ business, locale, description }: { business: Business; locale: Locale; description: string }) {
  const url = `${business.siteUrl}${localePath(locale)}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Store", // Store is a kind of LocalBusiness in schema.org
    "@id": `${business.siteUrl}/#store`,
    name: business.storeName,
    description,
    url,
    inLanguage: htmlLang[locale],
    image: `${business.siteUrl}/og.png`,
    logo: `${business.siteUrl}/icon.svg`,
    telephone: business.phone.international,
    email: business.email,
    taxID: business.gstin,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    ...(business.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: business.geo.latitude, longitude: business.geo.longitude } }
      : {}),
    hasMap: business.directionsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: business.openingHours.opens,
        closes: business.openingHours.closes,
      },
    ],
    openingHours: `${business.openingHours.days[0]}-${business.openingHours.days.at(-1)} ${business.openingHours.opens}-${business.openingHours.closes}`,
    parentOrganization: { "@type": "Organization", name: business.parentName },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: business.phone.international,
      contactType: "sales",
      availableLanguage: ["English", "Hindi", "Marathi"],
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
