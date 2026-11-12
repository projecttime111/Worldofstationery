/**
 * Business facts and brands: the starting values (seed) for the database, and the fallback
 * the site uses whenever the database is not set up or cannot be reached.
 * Once the site runs with the database (Neon), the owner edits these in the admin console, not here.
 * Pages get them through lib/content.ts. Do not add facts that the business has not confirmed.
 */

export type Brand = {
  /** Used in links to the brand's card on the catalogues page: /catalogues#<slug> */
  slug: string;
  name: string;
  /** Path under /public, or null when no logo file has been supplied yet. */
  logo: string | null;
  /** Intrinsic size of the logo file, needed by next/image. */
  width?: number;
  height?: number;
};

export type Business = {
  storeName: string;
  parentName: string;
  leader: string;
  yearsExperience: number;
  siteUrl: string;
  phone: { display: string; international: string; tel: string; whatsapp: string };
  email: string;
  gstin: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string };
  geo: null | { latitude: number; longitude: number };
  directionsUrl: string;
  mapsEmbedUrl: string | null;
  openingHours: { days: string[]; opens: string; closes: string };
  /** Social profile links; an empty string means the icon is hidden. */
  socials: { instagram: string; facebook: string; youtube: string };
  keyPartner: Brand;
  authorisedBrands: { row2: Brand[]; row3: Brand[] };
  alsoDealIn: Brand[];
};

export const business: Business = {
  storeName: "World of Stationery",
  parentName: "Yamuna Enterprises",
  leader: "Deepak Chandak",
  yearsExperience: 22,

  /** Final production URL, no trailing slash. Update when the domain is bought. */
  // [placeholder] Set SITE_URL when building, or replace this once the domain is bought.
  siteUrl: (process.env.SITE_URL ?? "https://example.com").replace(/\/$/, ""),

  phone: {
    display: "8999126686",
    international: "+91 89991 26686",
    tel: "+918999126686",
    whatsapp: "918999126686",
  },
  email: "yamunaent@gmail.com",
  gstin: "27ABBPC1393E1Z4",

  address: {
    street: "Yamuna Sankul, Opp. Main Hospital, New Radha Kishan Plot",
    locality: "Akola",
    region: "Maharashtra",
    postalCode: "444001",
    country: "IN",
  },

  /** Placeholder until the owner confirms exact coordinates. Leave null to omit from JSON-LD. */
  geo: null,

  directionsUrl: "https://share.google/bSqQHbPPHxQPZRs7E",

  /**
   * Google Maps embed URL (the src of the iframe from Maps > Share > Embed a map).
   * While this is null, the Visit section shows the address card only.
   */
  mapsEmbedUrl: null,

  /** Structured opening hours for JSON-LD. Display text lives in content/<lang>.json. */
  openingHours: { days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "09:00", closes: "20:00" },

  socials: { instagram: "", facebook: "", youtube: "" },

  /**
   * Brands section, drawn as a pyramid: key partner on top, then row 2, then row 3.
   * Logo files in public/brands/ are trimmed copies made by `npm run logos` from assets/brands/.
   */
  keyPartner: { slug: "shape", name: "Shape", logo: "/brands/shape.webp", width: 320, height: 176 },

  authorisedBrands: {
    row2: [
      { slug: "worldone", name: "Worldone", logo: "/brands/worldone.webp", width: 120, height: 120 },
      { slug: "creations", name: "Creations", logo: "/brands/creations.webp", width: 274, height: 120 },
    ],
    row3: [
      { slug: "soni-office-mate", name: "Soni Office Mate", logo: "/brands/soni-office-mate.webp", width: 409, height: 120 },
      { slug: "benelux", name: "Benelux", logo: "/brands/benelux.webp", width: 120, height: 120 },
      { slug: "desmat", name: "de'smat", logo: "/brands/desmat.webp", width: 251, height: 120 },
      { slug: "infinity", name: "Infinity", logo: null },
    ],
  },

  alsoDealIn: [{ slug: "goldex", name: "Goldex", logo: "/brands/goldex.webp", width: 271, height: 120 }],
};

/** wa.me link to the shop's WhatsApp number (from the loaded business details), with an optional ready message. */
export const whatsappUrl = (whatsapp: string, text?: string) =>
  `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
