# World of Stationery

The website of **World of Stationery**, the online store of **Yamuna Enterprises**, Akola.
English, Hindi and Marathi.

> **Round 3 in progress** (admin console, file-based quotations, collections; plan in `docs/PLAN-v3.md`). Phase 1 is done: the site now runs as a Next.js server app that can read its content from a Supabase database, and falls back to the files in `content/` when no database is set up. Nothing on the public pages has changed.

- Home: `/en/`, `/hi/`, `/mr/`
- Bulk and wholesale (with the WhatsApp quotation form): `/en/bulk/`, `/hi/bulk/`, `/mr/bulk/`
- Brand catalogues: `/en/catalogues/`, `/hi/catalogues/`, `/mr/catalogues/`
- `/` sends visitors to `/en/`

Built with Next.js, TypeScript, Tailwind CSS and (optionally, from round 3) Supabase.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000/en/ while you edit. Without a `.env.local` the site uses the files in `content/`; to use a Supabase database, copy `.env.example` to `.env.local` and fill it in (see "Database" below).

To check the real built site:

```bash
npm run build
```

```bash
npm run serve
```

Then open http://localhost:4173/. Pages are built ahead of time and served by the Next.js server; they refresh by themselves within seconds when content changes in the database (and at least once an hour).

## Database (Supabase)

The database is optional until the admin console arrives (phase 4). Its structure is in `supabase/migrations/`, and `supabase/seed.sql` fills it with today's content from the `content/` folder.

- Every table has Row Level Security. Visitors can only read the published content (business details, offers, brands, categories, text edits). Only people listed in `admin_users` can change it, and only owners can manage admins, settings and the change history.
- Every content change is recorded in `audit_log`, with who, when, and the old and new values.
- Site texts stay in `content/<lang>.json`. The database stores only the texts changed in the admin (`text_overrides`), so the files remain the defaults.
- After changing `content/business.ts`, `catalogues.json`, `offers.json` or `photos.ts` by hand, run `npm run seed:sql` to rewrite `supabase/seed.sql`. The seed only adds missing rows; it never overwrites changes made in the admin.

Setting up a Supabase project is described in `DEPLOY.md`.

## Where to change things

Everything you are likely to edit is in the `content/` folder. You never need to touch the page code to change words, numbers or photos.

Once the site runs with the database, these files are only the starting values (and the fallback if the database cannot be reached): business details, brands, catalogues, offers and category pictures are then edited in the admin console (phase 6).

| What | File |
| --- | --- |
| Phone, email, address, GSTIN, hours, directions link, Google Maps embed, website address | `content/business.ts` |
| Brands, their logos and the pyramid order (key partner, row 2, row 3, also deal in) | `content/business.ts` |
| Brand catalogues (PDFs, dates, what each brand supplies) | `content/catalogues.json`, files in `public/catalogues/` |
| All words on the site, in each language | `content/en.json`, `content/hi.json`, `content/mr.json` |
| Retail offers (numbers, dates, on/off) | `content/offers.json` |
| Pictures on the "What we stock" cards | `content/photos.ts` |

After any change, run `npm run build` and publish again (with Vercel this happens by itself when you push to GitHub, see `DEPLOY.md`).

### Business details

`content/business.ts` is the only place business facts live. The header, footer, contact section, Google structured data and every WhatsApp link read from it.

- **Website address:** `siteUrl` is a placeholder (`https://example.com`) until the domain is bought. Set it there, or set `SITE_URL` in Vercel's environment variables. It is used in the sitemap, canonical links and share previews.
- **Google Maps:** in Google Maps, open the shop, then Share > Embed a map, and copy only the `src="..."` address into `mapsEmbedUrl`. While it is `null`, the Visit section shows the address card alone.
- **Map pin for Google:** `geo` is `null`. Add `{ latitude: ..., longitude: ... }` once the owner confirms the exact spot.

### Words and translations

Each language has its own file with the same keys. Change the text between the quotes only, and keep the `{placeholders}` (like `{year}` or `{brand}`) as they are.

`hi.json` and `mr.json` are **draft translations** and are marked `"_review"` at the top. A native speaker must check them before launch.

### Offers

`content/offers.json` holds every offer number and date. It is `"enabled": false`, so the whole Offers section and its menu link are hidden. The numbers in it are the placeholders from the design. When the owner confirms the real values and dates:

1. Fill in `startDate` and `endDate` (written as they should appear, for example `1 December 2026`) and correct every number.
2. Set `"enabled": true`.

### Pictures on the "What we stock" cards

Each card shows a drawn illustration from `public/illustrations/categories/`. To use a real photo for a category instead:

1. Put the photo in `public/photos/`, for example `public/photos/notebooks.jpg`. Keep it around 1200 px wide or smaller, as `.jpg` or `.webp`. Use your own photos, not pictures from brand or company websites.
2. In `content/photos.ts`, change that category's one line to the photo's path and real size in pixels:
   `{ src: "/photos/notebooks.jpg", width: 1200, height: 800 }, // Notebooks and registers`

Photos are cropped to fill the card. Illustrations are shown whole.

### Brand logos

The original logo files supplied by the business are in `assets/brands/`. The site uses trimmed copies in `public/brands/`: empty borders removed and resized, so every logo shows at the same height. To make them again (for example after adding a logo), put the original in `assets/brands/` and run:

```bash
npm run logos
```

It prints each new size. Copy those into `content/business.ts` and `content/catalogues.json`.

In `content/business.ts`:

- `keyPartner` is the top of the pyramid (Shape), with the "Key partner" badge.
- `authorisedBrands.row2` and `authorisedBrands.row3` are the next two rows.
- `alsoDealIn` is the "We also deal in" row. A "10+ more companies" tile is always added after it.

A brand with `logo: null` (Infinity, for now) shows its name in the same tile style. Every brand tile links to that brand's card on the catalogues page.

### Brand catalogues

The catalogues page (`/en/catalogues/` and so on) lists one card per brand from `content/catalogues.json`. While a brand has no PDF, its card shows "Request catalogue on WhatsApp", which opens WhatsApp with a ready message.

To add a catalogue:

1. Get the PDF from the company, with their permission to publish it.
2. Keep it under 10 MB. If it is bigger, compress it first (for example with a free "compress PDF" tool, or "Reduce file size" when saving from Acrobat).
3. Save it as `public/catalogues/<slug>.pdf`, using the brand's `slug` from `catalogues.json` (for example `public/catalogues/shape.pdf`).
4. In `content/catalogues.json`, set that brand's `"pdf": "/catalogues/shape.pdf"` and `"updated": "November 2026"`.

The card then shows "View catalogue" (opens the PDF in a new tab), a "Download" link, and the "Updated" date.

Each brand also has a `categories` line (what it supplies) in English, Hindi and Marathi. These are empty until the owner confirms them. An empty line is simply not shown.

### Icons and share image

The favicon, apple-touch-icon and the 1200 × 630 share image (`public/og.png`) are made from the logo by `npm run images`. Run it again only if the logo or tagline changes.

### Quotation form

The form on the bulk page checks the answers, then opens WhatsApp with a ready message to 8999126686. The customer presses send. Nothing is stored on any server.

`lib/submitEnquiry.ts` has a marked hook for also saving enquiries to a Google Sheet later (through a Google Apps Script web app). It is not switched on.

## Notes from the build

- **iBall** is not on the site, at the owner's request ("it was just information"). This includes the "We also deal in" row and the catalogues page. To add it back, add an entry to `alsoDealIn` in `content/business.ts` and to `content/catalogues.json`.
- **Shape** is the top of the brands pyramid with a "Key partner" badge.
- **Free delivery and minimum order:** the site does not mention a delivery charge, free-delivery threshold or minimum order anywhere.
- **Hero:** an illustrated desk scene (inline SVG) with three floating number chips. The chips float and one pencil draws a line once on load. All motion stops for visitors who ask their phone for reduced motion.
- **About:** the Yamuna Enterprises brand card replaces the photo. On English pages its Devanagari line uses the phone's own font, so English pages do not download Baloo's Devanagari file for one line.
- When offers are off, the "Families and students" card leaves out the words "with the offers above" (they would point at a hidden section).
- On phones, the top bar shows just the phone number and the language buttons (hours are in the Visit section). Language buttons are 44 px tall for easy tapping.
- Headings load only the 800 weight of Baloo 2, which halves the font download. The small "World of" in the logo is therefore 800 instead of 600.
- The form's error messages, the "WhatsApp is opening" notice, and the catalogues page intro are new text written for the site.

## Launch checklist

- [ ] Native speakers have reviewed `content/hi.json` and `content/mr.json`
- [ ] Offer values confirmed and `offers.json` enabled (or kept disabled)
- [ ] Brand catalogue PDFs added (with each company's permission)
- [ ] What each brand supplies filled in (`categories` in `content/catalogues.json`)
- [ ] Logo for Infinity added, if the business has permission
- [ ] Brand permission confirmed for every logo shown
- [ ] Domain bought and connected (check spelling: "stationery" with an e is the paper-goods word), and `siteUrl` updated
- [ ] Google Maps embed URL added
- [ ] Google Business Profile links to the site
