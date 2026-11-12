# Round 3 plan: admin console, file-based quotations, collections

Status: **approved; phase 1 done** (12 November 2026). Questions in section 9 are still open.

## Progress

**Phase 1 (foundation): done.** Server build, Supabase migration with Row Level Security, seed generated from `content/`, content loader with file fallback, `.env.example`. One change from the plan: site texts are not copied into the database. They stay in `content/<lang>.json` and the database stores only the texts edited in the admin (`text_overrides`), so text changes made in code in later phases still show up. Checked without Docker: the migration and seed run in PGlite (Postgres in Node, in a temporary folder outside the project), 24 access-rule checks pass, and the seeded database gives exactly the same content as the files. Not yet run against a real Supabase project. Round 2 is still uncommitted (waiting for a git name and email).

## 1. Where the site is today

- Next.js 16.4.6 App Router, `output: "export"`: plain HTML in `out/`, no server.
- Three languages under `app/[lang]` (`/en`, `/hi`, `/mr`); pages: home, bulk, catalogues.
- All content is in `content/business.ts`, `content/{en,hi,mr}.json`, `content/catalogues.json`, `content/offers.json`, `content/photos.ts`.
- The bulk form only opens WhatsApp. Nothing is stored anywhere.
- Lighthouse mobile: 95–98 on English pages; 92–94 on the Hindi and Marathi home and catalogues pages (Devanagari heading font).
- **Nothing is committed to git yet.** Round 2 should be committed before this rebuild starts (needs a name and email for git).

## 2. Architecture

| Area | Today | After round 3 |
| --- | --- | --- |
| Build | static export | normal Next.js server build (`output` removed) |
| Public pages | static HTML | still static, cached with `"use cache"` + `cacheTag`; admin saves call `updateTag` / `revalidatePath` so changes are live within seconds |
| Content | JSON files | Supabase tables, seeded from today's JSON so nothing changes visually. If Supabase is unreachable during a build, pages fall back to the bundled JSON, so a paused free project can't break the site |
| `/` redirect | meta refresh + `vercel.json` + `_redirects` | `redirects()` in `next.config.ts` |
| Request guard | none | `proxy.ts` (Next 16's name for middleware): admin auth check, 12-hour session cap, `noindex` header on `/admin` |
| Server code | none | Route handlers (`/api/track`, `/api/enquiry/*`, `/api/cron/*`) and server actions for the admin |
| Secrets | none | `.env.local` (git-ignored) and `.env.example`; service-role key only in server files marked `import "server-only"` |

### Supabase

All tables are SQL migrations in `supabase/migrations/`, with RLS on every table.

- **Public (anon) can only insert:** `enquiries`, `analytics_events` (both through server routes that validate with zod), and upload into the private `enquiry-files` bucket through signed upload URLs. Anon has **no select** policy on anything private.
- **Admins** (signed in, email in `admin_users`) read and write; owner-only rules for settings and users are enforced in RLS too, not just in the UI.
- Main tables: `admin_users`, `enquiries`, `enquiry_files`, `enquiry_items`, `enquiry_notes`, `quotations`, `quotation_items`, `analytics_events`, `daily_stats`, `daily_salt`, `rate_limits`, `audit_log`, `settings`, and content tables (`business`, `announcement`, `offers`, `brands`, `catalogues`, `categories`, `category_brands`, `collections`, `collection_tags`, `stats`, `translations`).
- Reference numbers `WOS-YYMM-NNNN` come from a Postgres function with a per-month counter.
- Buckets: `enquiry-files` (private), `content-media` (public: logos, catalogue PDFs, photos), `backups` (private).

### Scheduled jobs

Route handlers under `/api/cron/*`, protected by a `CRON_SECRET`, called by the host's cron or a free GitHub Actions schedule:

- daily keep-alive (one light query, so the free project is not paused);
- nightly rollup of `analytics_events` into `daily_stats`, deleting raw events older than 90 days;
- nightly retention: enquiry files older than N months (default 12) are deleted; a warning list appears in the admin a week before;
- weekly CSV backup of enquiries, the events summary and the content tables into the private `backups` bucket.

## 3. Public site changes

### Header (all pages)

- Floating rounded white bar (24 px radius, soft shadow, 12 px from the top), sticky; more compact after 80 px of scrolling.
- Nav: Home · Products ▾ · Collections ▾ · Brands ▾ (small logos) · Catalogues · About · Contact. Dropdowns open on hover and click and work with the keyboard. On phones they become an accordion in a full-screen menu.
- Right: search button (searches categories, collections, brands and catalogues in the browser; the index loads only when search opens), social icons (hidden while empty), yellow "Order on WhatsApp" pill.
- The "by Yamuna Enterprises" lockup stays.
- See question 9.6 about the Bulk page and Offers in this nav.

### What we stock: "Send enquiry" on every card

- Each card becomes one `<button>` ("Send enquiry for Billing rolls"); lift + Navy border + "Send enquiry →" pill on hover and focus, pill always shown on touch screens.
- Native `<dialog>`: centred 520 px on desktop, bottom sheet with drag handle on phones (max 90% height). Focus trap, Esc, backdrop and ✕ close, focus returns to the card, page scroll locked.
- Two equal choices: **Send enquiry** (short form: name, WhatsApp number, I am a…, details with a per-category placeholder, up to 2 files, consent, Turnstile, honeypot) and **Chat on WhatsApp** (pre-filled message in the current language).
- "View catalogues for this category" → `/[lang]/catalogues/?category=<slug>`, filtered to the brands linked in the admin (all brands while none are linked).
- Typed answers are kept in `sessionStorage` per category until a successful submit.
- `#enquire-<slug>` opens the dialog directly.
- The hint says "We'll get back to you soon" unless the owner confirms "usually within a day" (question 9.5).
- The dialog code loads only when a card is first clicked or a hash asks for it, to protect the home page score.

### Collections (between "What we stock" and Brands)

- Five tabs: Corporate gifting, Art and creativity, School essentials, Office and IT, Billing and retail supplies. Copy for Corporate gifting is the owner's; the other four are drafts I write in the same style, marked for review.
- Spotlight panel as described in the brief (image card 55% left, Navy pill, Playfair Display 600 headline, Inter 18 px description, 44 px tag pills, one main button, soft Paper radial wash).
- ARIA tabs with arrow keys, swipe on phones, optional 7-second auto-advance with a visible pause button (paused on hover, focus, hidden tab and reduced motion), 250 ms image fade only, `#collection-<slug>` hashes.
- Images: five new illustrated SVG panels in the style of the category illustrations, until the owner uploads permitted photos in the admin.
- Playfair Display is loaded with `next/font` (latin only, weight 600) and used only for these headlines. Hindi and Marathi headlines use Baloo 2, because Playfair has no Devanagari.

### Bulk page: file uploads

- Drag-and-drop area plus "Choose files": `.xlsx .xls .csv .docx .pdf .jpg .jpeg .png`, max 5 files × 10 MB. File chips with name, size, remove and a progress bar.
- Rejected: `.xlsm .docm .doc`, executables, archives. The server checks the extension **and** the magic bytes.
- The needs field becomes optional once a file is attached.
- Two buttons: **Submit enquiry** (saves, shows `WOS-2611-0042`, "a quotation comes within one week", and "Also message us on WhatsApp" with the reference) and **Send on WhatsApp only** (today's behaviour).
- Flow: create enquiry (Turnstile + honeypot + 5 per hour per IP, counted with a salted hash, not the raw IP) → server returns signed upload URLs under `enquiries/<id>/<random>` → browser uploads with progress → `finalise` call checks the files and starts parsing.

### Analytics tracker

- About 1 KB of script sending to `/api/track` with `navigator.sendBeacon`: event, path, language, device type, referrer domain, UTM fields, brand / collection / category.
- No cookies, no IP stored. Unique visitors = SHA-256 of (daily salt + IP + user agent), computed on the server; the salt is replaced every day and the old one deleted.
- Bots (user-agent list) and signed-in admins are ignored.
- All events from the brief, plus `category_card_open`, `category_enquiry_submitted`, `category_whatsapp_click`.
- New privacy page `/[lang]/privacy/` explaining what is counted (new text I write, marked for review), linked from the footer.

## 4. Admin console (`/admin`, English only)

- Supabase Auth: email + password, magic-link fallback; only emails in `admin_users`. Roles: owner, staff. `noindex, nofollow`, not in the sitemap, login rate-limited, logout after 12 hours.
- Layout: sidebar on desktop, bottom tab bar on phones.
- **Dashboard:** date range (Today, 7, 30, 90 days, Custom) with change vs the previous period on every number; the nine number cards; the Recharts charts from the brief plus "Interest by category" and the quoted pipeline value; the "Needs attention" list. Recharts loads only in the admin, never on public pages.
- **Enquiries inbox:** filters (status, customer type, date, has attachments, source: category card / bulk page / collections), search, CSV and Excel export, unread badge.
- **Enquiry detail:** customer block, needs text, status (with lost reason), assignee, follow-up date, timestamped notes, "Reply on WhatsApp", and the tabs **Combined list | one tab per file | Files**:
  - Combined list: editable table (source, item, brand, spec, qty, unit, notes, rate ₹, GST %, amount), merge duplicates with per-merge undo, sort, filter, add rows, low-confidence rows highlighted.
  - Per-file tab: parsed rows next to a preview (sheet grid, extracted text, or the image). File contents are always shown as escaped text, never as HTML.
  - Files tab: signed download links that expire after 10 minutes.
  - Quotation export: Excel (exceljs, branded, valid until today + 15 days, terms text from Settings) and PDF (see question 9.3). Saving sets "Quotation sent" and records the total.
- **All open requirements:** every open enquiry's rows grouped by item, with total quantity, number of customers, and filters.
- **Content:** business details and socials, announcement bar, offers, brands (logo upload trimmed with sharp, row, key partner, order), catalogues (PDF ≤ 10 MB, updated month), categories (text, image, enquiry on/off, placeholder, linked brands), collections, stats strip. Every text field has EN / HI / MR side by side with "Copy from English". Preview before publish; publish revalidates the affected pages.
- **Audit log:** who changed what and when, old and new values; owners can roll back one change.
- **Settings (owner):** admin users (invite, role, remove), data retention months, quotation terms text, "Download full backup now" (ZIP of CSVs).
- **New-enquiry email** to yamunaent@gmail.com only if the owner approves an email service (question 9.4); otherwise the badge count only.

## 5. File parsing (server)

- **Excel / CSV:** SheetJS Community Edition from `cdn.sheetjs.com` (reads `.xls` as well as `.xlsx`, and handles merged cells; formulas are never evaluated, only cached values are read). Header row = first row with 2+ non-empty text cells. Fuzzy header map in English, Hindi and Marathi (Item / Particulars / Description / Product / सामान / वस्तू → item; Qty / Quantity / Nos / संख्या / नग → quantity; and so on). Empty and total rows skipped; original row numbers kept.
- **Word (.docx):** mammoth to HTML, tables read the same way (parsed as data, never rendered); without tables, numbered or bulleted lines become items, with quantities from patterns like `50 nos`, `x 100`, `- 20`.
- **PDF:** text via `pdfjs-dist` (legacy build), same line patterns, marked low confidence.
- **Images:** stored and shown, no OCR.
- Parsing runs in the `finalise` step (server action/route); a file that fails to parse is kept and flagged, and the enquiry still goes through.
- Excel writing for quotations uses exceljs (SheetJS CE cannot style cells).

## 6. Delivery in phases

Each phase ends with a working build and a short report, so the owner can check progress and change direction early.

1. **Foundation:** commit round 2; switch to the server build; Supabase schema, RLS, seed from JSON; content read from the database with JSON fallback; `.env.example`. *Check: the site looks exactly as it does now.*
2. **Enquiries:** bulk page uploads, category-card dialog, Turnstile, rate limits, reference numbers, parsers with unit tests.
3. **Collections and header.**
4. **Admin core:** login, roles, inbox, enquiry detail, combined list, quotation Excel and PDF, all open requirements.
5. **Analytics:** tracker, `/api/track`, rollup, dashboard, privacy page.
6. **Content management:** content editors, preview, publish, audit log and rollback, settings, backups, retention.
7. **Wrap-up:** RLS tests, end-to-end checks on desktop and phone, 360/768/1280 in three languages, Lighthouse, README and DEPLOY.md (hosting comparison with current prices and terms links), list of what the owner still has to provide.

## 7. Risks

- **Lighthouse 95 on the home page.** The new header, collections tabs, dialog and tracker all add JavaScript. Plan: keep the collections panel server-rendered with a small script for tabs; load the dialog, search and dropdown menus only on first use; tracker via `sendBeacon` after load. Hindi and Marathi already sit at 92–94 (see round 2).
- **Supabase free plan:** pauses after a week without activity and has no automatic backups; covered by the keep-alive and weekly CSV backup. DEPLOY.md will say when Pro is worth it (for example: once enquiries matter day to day, or files near the 1 GB storage limit).
- **Hosting:** sharp (logo upload) and file parsing need a Node runtime. Some edge-only free tiers can't run sharp, which affects the hosting choice.
- **Size:** this round is several times larger than rounds 1 and 2 together.

## 8. Text I will write that the owner has not seen

The four other collection headlines, descriptions and tags; the privacy page; upload-area and error messages; dialog labels other than the ones in the brief; all Hindi and Marathi drafts (marked `_review`). Business facts are never invented.

## 9. Questions for the owner

1. **Local Supabase needs Docker Desktop**, which is not installed on this PC. Install Docker Desktop (free for small businesses), or use a free Supabase cloud project as the development database?
2. **Dependencies outside the approved list:**
   - Vitest (test runner) for the parser and RLS tests;
   - the Supabase CLI (`supabase`, dev only) for migrations;
   - fflate (tiny ZIP library) for "Download full backup now";
   - for the PDF quotation, see 9.3.
3. **PDF quotation:** (a) pdf-lib + @pdf-lib/fontkit: a real PDF download, with Hindi/Marathi names supported by embedding a Devanagari font; or (b) no new dependency: a print-ready quotation page that the browser saves as PDF ("Save as PDF" in the print dialog, also on Android).
4. **New-enquiry email:** use Resend's free tier (needs a free account and, ideally, the shop's own domain) or badge only?
5. **Reply time:** may the dialog say "usually within a day"? If not: "We'll get back to you soon".
6. **Nav:** the new nav in the brief has no Bulk orders link and no Offers link. Keep "Bulk orders" in the header (and Offers when switched on)?
7. **Hosting:** I will compare options in DEPLOY.md with current prices and terms; nothing is set up until you choose.
8. **Git name and email** for the commits (round 2 is still uncommitted).
