# Build the World of Stationery website

Paste everything below this line into Claude Code, run from the root of this folder.

---

You are building the production website for **World of Stationery**, the online store of **Yamuna Enterprises**, a stationery and IT-peripheral distributor in Akola, Maharashtra. The design is already finished. Build it faithfully, in three languages, as a fast static site that a small family business can run with no monthly server cost.

## 0. Files in this folder

- `design-reference/Main.dc.html`: the home page design. Copy, layout, colours, spacing and section order are final. Treat it as the visual spec. It uses a custom templating syntax (`<x-dc>`, `<sc-for>`, `{{holes}}`, `/_blob/...` image paths). Do not copy that syntax. Rebuild the pages as normal components.
- `design-reference/Schools.dc.html`: the "Bulk and wholesale" page with the enquiry form.
- `design-reference/Brand.dc.html`: World of Stationery logo sheet, colours and type.
- `design-reference/YamunaLogo.dc.html`, `Banner.dc.html`, `CardFront.dc.html`, `CardBack.dc.html`: print designs for the offline store. They are not part of the website. Do not build them.
- `assets/logos/world-of-stationery-mark.svg`: the site logo mark.
- `assets/logos/yamuna-enterprises-mark.svg`: the parent company mark, used small in the footer and About section.
- `assets/brands/*`: brand logos supplied by the business. In the design files, the `/_blob/...` URLs map to these files: `bc40f8db…` = worldone.jpg, `da491d64…` = creations.jpg, `047a7039…` = soni-office-mate.jpg, `8430e005…` = benelux.png, `81bf806a…` = desmat.png, `e55b7d63…` = shape.png, `e2f099eb…` = goldex.png.

## 1. Tech stack

- **Next.js** (current stable, App Router) with **TypeScript** and **Tailwind CSS**, built as a fully static export (`output: 'export'`). No database and no server code.
- Fonts via `next/font/google`: **Baloo 2** (600, 700, 800) for headings and **Inter** (400 to 700) for body text. Baloo 2 covers Devanagari, so Hindi and Marathi headings render properly.
- Deploy target: Vercel or Cloudflare Pages, free tier. Add a short `DEPLOY.md` with the steps.
- Use npm. Keep dependencies minimal. No UI kit and no animation library.

## 2. Languages (English, Hindi, Marathi)

- Routes: `/en`, `/hi`, `/mr`. The root `/` redirects to `/en`.
- Every visible string lives in `content/en.json`, `content/hi.json` and `content/mr.json`. Components never hard-code copy.
- Write the English file from the design copy exactly. Then draft the Hindi and Marathi files yourself, in simple everyday language that a shopkeeper or parent in Vidarbha would use. Keep brand names, phone numbers, email and GSTIN unchanged in Latin script.
- Put `"_review": "Draft translation - needs check by a native speaker before launch"` at the top of `hi.json` and `mr.json`, and list both files in the README launch checklist.
- In Marathi, the business name is written **यमुना एंटरप्रायझेस**. In Hindi, use **यमुना एंटरप्राइजेज**.
- Language switcher in the top bar, as in the design: English · हिंदी · मराठी. It keeps the current page and section, sets `<html lang>`, and adds `hreflang` alternate links.

## 3. Business facts (use exactly, do not add any others)

| Field | Value |
| --- | --- |
| Online store name | World of Stationery |
| Parent business (offline store) | Yamuna Enterprises |
| Leadership | Deepak Chandak |
| Experience | 22 years in stationery distribution |
| Range | 2,000+ products, 10+ brands |
| Reach | Retail distribution across 5+ districts |
| Customers | Schools, colleges, tuition classes, companies, banks, retailers, families |
| Address | Yamuna Sankul, Opp. Main Hospital, New Radha Kishan Plot, Akola, Maharashtra 444001 |
| Hours | Monday to Saturday, 9:00 AM to 8:00 PM. Closed on Sundays |
| Phone and WhatsApp | 8999126686 (international format +91 89991 26686, wa.me/918999126686) |
| Email | yamunaent@gmail.com |
| GSTIN | 27ABBPC1393E1Z4 |
| Directions link | https://share.google/bSqQHbPPHxQPZRs7E |
| Authorised distributor for | Worldone, Creations, Soni Office Mate, Benelux, de'smat, Infinity |
| Also deals in | Shape, Goldex, iBall (computer peripherals) |
| Retailer terms | Free delivery on orders of ₹2,000 and above. 30-day payment cycle. Extra discount for payment on the spot |
| Institution terms | Special terms and offers, agreed at the store. Written quotation within one week |

Keep all of this in one file, `content/business.ts`, and import it everywhere: header, footer, contact section, JSON-LD and WhatsApp links. Never invent prices, reviews, client names, years, certifications or statistics. If something in the design is in [square brackets], it is a placeholder. Leave it configurable and flag it in the README. Do not make up a value.

## 4. Pages and sections

### `/[lang]` (home), in this order, matching `Main.dc.html`

1. **Top bar** (navy): phone and hours, plus the language switcher.
2. **Header**: logo mark with the "World of / STATIONERY / by Yamuna Enterprises" lockup, then nav (Products, Brands, Offers, About us, Bulk and wholesale) and a green "WhatsApp us" button. On phones this collapses into an accessible menu button.
3. **Hero**: badge, H1 "2,000+ stationery and IT products. One supplier you can trust.", supporting paragraph, two buttons (Order on WhatsApp, Bulk and wholesale enquiry), and a photo slot.
4. **Numbers band**: 22+ years, 2,000+ products, 5+ districts, 10+ brands.
5. **What we stock**: 8 category cards (notebooks and registers, diaries and planners, billing rolls, files and folders, photo paper and cartridges, computer and IT peripherals, school stationery, office stationery), each with a photo slot. No prices.
6. **Authorised distributor** logo grid, plus "We also deal in". Infinity and iBall have no logo file yet, so render their names as text in the same tile style until a logo is supplied.
7. **About us**: copy as in the design, with a photo slot for Deepak Chandak.
8. **Offers for retail customers**: three cards (bill-size offer, refer a friend, Gold customer). All numbers and dates come from `content/offers.json`. Set `"enabled": false` until the owner confirms the values. When disabled, the whole section and its nav link are hidden.
9. **Who we serve**: 4 cards.
10. **How ordering works**: 3 steps.
11. **Visit Yamuna Enterprises**: address, hours, phone, email, and buttons for WhatsApp, Call (`tel:`) and Directions. Add a lazy-loaded Google Maps embed only once `content/business.ts` holds a real embed URL. Until then, show the address card alone.
12. **Footer**: legal line with GSTIN, a small Yamuna Enterprises mark, and the line "Brand names and logos belong to their owners."

### `/[lang]/bulk` (bulk and wholesale), matching `Schools.dc.html`

Hero, "What we can supply", a terms table split into Retailers and Institutions, and the **quotation form**.

### Quotation form behaviour (no backend)

- Fields: organisation name, type (school, college, coaching or tuition class, stationery shop or reseller, company or bank, other), your name, WhatsApp number, area or town, what you need, and a consent checkbox. Name, number and consent are required.
- Validate on the client with clear inline errors. The number must be a 10-digit Indian mobile number.
- On submit, open `https://wa.me/918999126686?text=...` with a neatly formatted, URL-encoded message containing the answers. This is the only submission method for version 1.
- Leave a clearly marked hook (`lib/submitEnquiry.ts`) so a Google Apps Script web app can be added later to also log enquiries to a Google Sheet. Do not build that now.
- Collect no data about children. Do not add analytics cookies.

## 5. Design system

Copy these tokens into `tailwind.config` and use only them:

- Navy `#1B3A6B` (headings, primary), Pencil Yellow `#F2B33D` (highlights and offer card backgrounds only, never as text on white), Paper `#F7F5EF` (alternate section background), Ink `#1A1D21`, Body grey `#3F444B`, Muted `#5A5F66`, Border `#E6E2D6`, WhatsApp Green `#1F7A4D` (WhatsApp buttons only), Muted on navy `#D5DDEA`.
- Radius: 999px for buttons and pills, 18px for cards, 20px for photo slots.
- Content max-width 1200px, horizontal padding 24px, section vertical padding 72px on desktop and 48px on mobile.
- Type scale from the design: H1 58px, H2 40px, card titles 18 to 21px, body 16 to 19px. Scale down on mobile.
- Photo slots: until real photos exist, render a neutral `#EEEBE2` box with a short label. Photos go in `public/photos/` and are referenced from the content files. Use `next/image` with `unoptimized` for the static export, with explicit width and height.

## 6. Quality bar

- **Mobile first.** Most visitors arrive on phones from WhatsApp links. Check 360px, 390px, 768px and 1280px+. No horizontal scrolling at any width.
- **Accessibility:** semantic landmarks; real `<button>`, `<a>` and `<label>` elements; visible focus rings; touch targets of at least 44px; colour contrast of at least 4.5:1 (check yellow tiles); `alt` text on every logo; `aria-pressed` on the language buttons.
- **SEO and local search:** per-language `<title>` and meta description; Open Graph image (a 1200×630 PNG generated from the logo and tagline); `sitemap.xml`; `robots.txt`; and JSON-LD for `Store` / `LocalBusiness` with name, parent organisation, address, geo placeholder, phone, email, opening hours (Mo-Sa 09:00-20:00) and `priceRange` left out.
- **Performance:** Lighthouse mobile scores of 95+ for Performance, Accessibility, Best Practices and SEO. No client JavaScript except the language switcher, the mobile menu and the form.
- Favicon set and `apple-touch-icon` generated from `world-of-stationery-mark.svg`.

## 7. Work plan

1. Scaffold the project and Tailwind tokens, and commit.
2. Write the content files and build the home page in English to match `Main.dc.html`. Compare section by section and fix differences.
3. Build the bulk page and the form.
4. Add the Hindi and Marathi content and routing.
5. Add SEO, JSON-LD, sitemap and icons.
6. Run `npm run build`, serve the `out/` folder locally, and check every page in all three languages at phone and desktop widths. Run Lighthouse and fix anything under 95.
7. Write `README.md` with how to run it locally, how to edit content (business details, offers, photos, brands), and a **launch checklist**:
   - [ ] Native speakers have reviewed `hi.json` and `mr.json`
   - [ ] Offer values confirmed and `offers.json` enabled (or kept disabled)
   - [ ] Real photos added: shop front, shelves, 8 categories, Deepak Chandak
   - [ ] Logos for Infinity and iBall added, if the business has permission
   - [ ] Brand permission confirmed for every logo shown
   - [ ] Domain bought and connected (check spelling: "stationery" with an e is the paper-goods word)
   - [ ] Google Maps embed URL added
   - [ ] Google Business Profile links to the site
8. Write `DEPLOY.md` with step-by-step instructions for Vercel (free plan) and connecting a custom domain.

Ask me before adding any dependency outside Next.js, React, Tailwind and their usual tooling, and before changing any copy or business fact.
