<!-- Round 3 brief as given by the owner on 12 November 2026, kept word for word. Where it says Supabase, see docs/PLAN-v3.md: the database is now Neon Postgres. -->

World of Stationery: round 3 (admin console, file-based quotations, collections tabs)
Paste everything below the line into Claude Code, from the root of the existing website project.
Add four features to the World of Stationery site:

1. An admin console with analytics and content editing.
2. Quotation requests that accept the customer's own Excel, Word, PDF or photo lists, with every list visible in one place.
3. A tabbed "Collections" showcase on the home page, plus a better header.
4. A "Send enquiry" option on every category card in "What we stock".

First read the current codebase (pages, components, `content/*.json`, `content/business.ts`, the i18n set-up and the hosting config). Then write a short plan in `docs/PLAN-v3.md` and show it to me before you write code. Keep the design system as it is: Navy `#1B3A6B`, Pencil Yellow `#F2B33D`, Paper `#F7F5EF`, WhatsApp Green `#1F7A4D`, Baloo 2 and Inter. Every public-facing string goes into `en.json`, `hi.json` and `mr.json`, with the Hindi and Marathi still marked "needs native review". The admin console is English only.
0. Architecture change (read this first)
The site is currently a static export. These features need a database, file storage, logins and server code, so:

* Backend: Supabase (Postgres, Auth, Storage). Write every table as a SQL migration in `supabase/migrations/`, with Row Level Security turned on for every table. The public site may only insert enquiries, upload enquiry files and record analytics events. It can never read them back. Only signed-in admins can read and edit.
* Next.js: move from `output: 'export'` to the normal server build. Public pages stay static or ISR (incremental static regeneration). When an admin saves content, call on-demand revalidation (`revalidatePath` / `revalidateTag`) so the change goes live within seconds, without a redeploy.
* Hosting: the site belongs to a business, so it must run on a plan whose terms allow commercial use. Vercel's free Hobby plan does not allow that. In `DEPLOY.md`, compare the options (for example Vercel Pro, or a host whose free tier permits business use), with current prices and a link to each terms page. Recommend the cheapest one that fits, and ask me before setting anything up.
* Supabase free plan caveats: a free project is paused after a week of inactivity and has no automatic backups. So:
   * add a daily keep-alive (a scheduled function or cron hitting a lightweight query);
   * add a weekly backup job that exports the enquiries, the events summary and the content tables to a private storage bucket as CSV;
   * explain in `DEPLOY.md` when upgrading to Supabase Pro becomes worth it.
* Secrets: use `.env.local` and `.env.example`, and never commit keys. The service-role key is used only in server code.
* Ask me before adding any paid service or any dependency beyond: `@supabase/supabase-js`, `@supabase/ssr`, `exceljs` (or the official SheetJS build from cdn.sheetjs.com, not the outdated `xlsx` package on npm), `mammoth`, `pdf-parse` (or `pdfjs-dist`), `zod`, `recharts`, `sharp`, and a Cloudflare Turnstile client.

1. Admin console (`/admin`)
Access

* Login with Supabase Auth, using email and password plus a magic-link fallback. Only emails in an `admin_users` table can get in. There are two roles:
   * owner: everything, including managing other admins;
   * staff: enquiries and content, but not settings or users.
* `/admin` carries `noindex, nofollow`, is left out of the sitemap, is rate-limited, and logs the user out after 12 hours.
* Use a layout that works on a phone, because the family will check it on their phones: a sidebar on desktop and a bottom tab bar on mobile.

Dashboard (home of the admin)
Add a date-range filter with Today, 7 days, 30 days, 90 days and Custom, and show the change against the previous period on every number.
Number cards:

* Visitors (unique, cookieless, see Analytics below)
* Page views
* WhatsApp clicks
* Call clicks
* Directions clicks
* Catalogue requests
* Quotation enquiries
* Enquiry-to-quotation-sent rate
* Average reply time to a new enquiry (from creation to the first status change)

Charts (Recharts, using brand colours):

* Visitors and page views per day (line chart)
* Actions per day: WhatsApp, call, enquiry (stacked bars)
* Top pages
* Language split (EN / HI / MR)
* Device split (mobile / desktop / tablet)
* Traffic sources: direct, Google, WhatsApp, Instagram, Facebook, other referrers, plus UTM campaigns (for example QR codes printed on the expo banner with `?utm_source=expo`)
* Most-requested catalogues by brand
* Enquiries by customer type (school, college, coaching, retailer, company or bank, other)
* Enquiry funnel: New → Contacted → Quotation sent → Won (a funnel chart showing the drop-off at each step)
* Collections tab views and clicks (from section 3)

Below the charts, show a "Needs attention" list: enquiries still New after 24 hours, follow-ups due today, and quotations sent more than 7 days ago with no update.
Analytics collection (privacy-friendly, no cookie banner needed)

* Write a tiny client tracker that sends events to `/api/track`. Each event has: event name, path, language, device type, referrer domain, UTM fields, and the brand or collection where relevant.
* Don't store IP addresses, cookies or personal data. For unique visitors, use a daily-rotating salted hash of (IP + user agent), computed on the server and never stored raw.
* Events: `page_view`, `whatsapp_click`, `call_click`, `directions_click`, `catalogue_view`, `catalogue_request`, `catalogue_download`, `enquiry_started`, `enquiry_submitted`, `collection_tab_view`, `collection_cta_click`, `language_switch`, `search_used`.
* Ignore bots (user-agent check) and admin sessions.
* Each night, roll raw events up into a `daily_stats` table so the dashboard loads fast. Keep raw events for 90 days and daily stats indefinitely.
* On the public site, add a short privacy page explaining what is counted.

Enquiries inbox

* A table of all enquiries, filterable by status, customer type, date and "has attachments", with search by name, organisation or phone.
* Each enquiry opens a detail view with:
   * the customer's details and the needs text;
   * every attached file (see section 2);
   * a status selector: New / Contacted / Quotation sent / Won / Lost (with a reason);
   * an assigned family member;
   * a follow-up date;
   * internal notes with a timestamp and author;
   * a "Reply on WhatsApp" button that opens wa.me with the customer's number and a pre-filled greeting.
* Export the filtered list to CSV and Excel.
* Send a new-enquiry notification by email to yamunaent@gmail.com. Use a transactional email service with a free tier, but ask me first. If I say no, show only a badge count in the admin.

Content management ("future changes" without touching code)
Admin screens to edit everything that today lives in `content/*.json`. Move that content into database tables and seed them from the current JSON, so nothing changes visually.

* Business details: phone, email, hours, address, GSTIN, map embed URL, and social links (Instagram, Facebook, YouTube; empty means hidden).
* Announcement bar: on/off, text in EN/HI/MR, a link, and start and end dates.
* Offers: on/off, every value and date, and the conditions text.
* Brands: add, edit or remove; logo upload (auto-trimmed and resized with sharp); pyramid row; "Key partner" flag; authorised or "also deal in"; and the order within each row.
* Catalogues: upload or replace a PDF per brand (max 10 MB), and set the "updated" month.
* Categories: name, description and image (the default illustration, or an uploaded photo).
* Collections: the tabs and slides from section 3.
* Stats strip: the numbers and labels (22+, 2,000+, 5+, 10+).

Every editable text field has EN, HI and MR inputs side by side, with a "Copy from English" button.

* Every edit shows a preview before publishing. Publishing revalidates the affected pages.
* An audit log records who changed what and when, with the old and new values. Owners can view it and roll back a single change.

Settings (owner only)

* Admin users: invite, change role, remove.
* Data retention: enquiry files are deleted after N months (default 12), with a warning list one week before.
* Download a full backup now (ZIP of CSVs).

2. Quotation requests with Excel, Word, PDF and photo lists
Schools, colleges and companies often send their requirement list as an Excel or Word file. Make the bulk enquiry form accept those, and show the admin everything in one place.
Public form changes (`/[lang]/bulk`)

* Add a drag-and-drop upload area labelled "Upload your list (Excel, Word, PDF or a photo)", with a "Choose files" button for phones.
* Accept `.xlsx`, `.xls`, `.csv`, `.docx`, `.pdf`, `.jpg`, `.jpeg`, `.png`. Allow up to 5 files of 10 MB each.
* Reject `.xlsm`, `.docm`, `.doc` (old binary Word), executables and archives. Check both the file extension and the real file type (magic bytes) on the server.
* Show each chosen file as a chip with its name, size, a remove button and an upload progress bar.
* The text field "What do you need, and roughly how much?" becomes optional when at least one file is attached.
* Add Cloudflare Turnstile to block spam, plus a honeypot field and per-IP rate limiting (no more than 5 submissions an hour).
* Files upload straight to a private Supabase Storage bucket through signed upload URLs, each with a random name, in `enquiries/<enquiry_id>/`.
* Keep the existing "Send on WhatsApp" option. The form now offers two buttons:
   * Submit enquiry: saves to the database, shows a confirmation with a reference number such as `WOS-2611-0042`, and offers "Also message us on WhatsApp", pre-filled with that reference;
   * Send on WhatsApp only: the old behaviour, which cannot carry files.
* The success screen tells them, in their language, that a quotation comes within one week.

Parsing on the server (after upload, in a background job or server action)

* Excel / CSV: read every sheet. Find the header row (the first row with two or more non-empty text cells), then map columns to `item`, `brand`, `size/spec`, `quantity`, `unit` and `notes`. Use fuzzy header matching in English, Hindi and Marathi: for example "Item", "Particulars", "Description", "Product", "सामान", "वस्तू" → item; "Qty", "Quantity", "Nos", "संख्या", "नग" → quantity. Skip empty rows and total rows. Keep the original row number.
* Word (.docx): use mammoth. Read every table the same way. If there are no tables, split numbered or bulleted lines into items and pull out quantities with patterns like `50 nos`, `x 100`, `- 20`.
* PDF: extract the text and apply the same line patterns. Mark the result "low confidence".
* Images: don't run OCR. Store and show them only.
* Save the parsed rows to an `enquiry_items` table: enquiry id, source file, sheet name, row number, the mapped fields, the original row text and a confidence level.
* Never execute macros or formulas, and never render file contents as HTML without escaping.

In the admin: "All lists in one place"
In the enquiry detail view, add a tab bar: Combined list | one tab per file | Files.

* Combined list: one editable table merging every parsed row from every file:
   * columns: source file, item, brand, size/spec, quantity, unit, notes, plus our columns for rate (₹), GST % and amount;
   * "Merge duplicates" combines rows with the same item, brand and spec, adds up the quantities, and lets you undo each merge;
   * sort, filter, inline editing, and adding rows by hand;
   * rows with low confidence are highlighted for checking.
* Per-file tabs: the parsed rows exactly as they were in that file, next to a preview of the file (a sheet grid for Excel, extracted text for Word and PDF, the image itself for photos).
* Files tab: original files with secure download links (signed URLs that expire after 10 minutes).
* Export the quotation:
   * Download as Excel: a branded quotation sheet with the Yamuna Enterprises header (logo, address, GSTIN, phone), quotation number and date, a "Valid until" date (default today + 15 days), the customer block, an item table with rate, GST and amount, totals, and a terms block whose text is editable in Settings;
   * Download as PDF: the same layout.
   * Saving a quotation sets the status to "Quotation sent" and records the total value, so the dashboard can show the quoted pipeline value.
* There is also an "All open requirements" admin page. It combines the lists from every open enquiry into one table: grouped by item, with total quantity and how many customers want it, with filters by customer type and date. This lets the family see in one place what to stock up on before the school season.

3. Collections tabs on the home page (reference: product spotlights on the Shape website)
The reference screenshots show a large product image on the left and, on the right, a big serif headline, a short description and pill-shaped tag buttons. Build the same pattern as a tabbed Collections section, placed between "What we stock" and the brands section.
Layout

* Section title: "Collections". Underneath, a row of tab pills that scrolls sideways on phones:
   * Corporate gifting
   * Art and creativity
   * School essentials
   * Office and IT
   * Billing and retail supplies
* The selected tab shows one spotlight panel:
   * Left (55% on desktop, full width on phones): a large white card with 20px radius and a soft shadow, holding the collection image, plus an optional small caption such as "Designs are for representation only, actual product may vary".
   * Right: a small Navy pill with the brand or label. Then the headline in Playfair Display at 600, 52px on desktop and 34px on mobile; use Playfair only for these headlines. Then a 2 to 3 line description in Inter at 18px, Muted colour. Then tag pills (white, 1px border `#E6E2D6`, 44px tall); each one links to a category, a catalogue or a pre-filled WhatsApp message. Finally, one main button: "Enquire on WhatsApp" (green) or "View catalogue".
   * Background: a very soft radial wash of Paper `#F7F5EF` into white behind the panel. No strong gradients.
* Behaviour:
   * accessible ARIA tabs (`role="tablist"`, arrow-key navigation, `aria-selected`, focus rings);
   * swipe between tabs on phones;
   * optional auto-advance every 7s, which pauses on hover, on focus, when the tab is hidden, and under `prefers-reduced-motion`, with a visible pause button;
   * the image fades in over 250ms on tab change; nothing else animates;
   * each tab has a URL hash (`#collection-corporate-gifting`) so it can be shared;
   * track `collection_tab_view` and `collection_cta_click` with the collection name.
* Starting content: five collections, with copy and tags in EN/HI/MR, all editable from the admin. Example for Corporate gifting: headline "Corporate gifting that gets noticed", description "Diaries, pen sets and planners for companies, banks and events. Bulk orders with your logo on request.", tags "Diaries", "Pen sets", "Bulk orders".
* Images: until I upload real photos in the admin, use your own illustrated SVG panels in the same style as the category illustrations. Don't copy product images from any company's website. I'll only upload brand marketing images that the company has given us permission to use.

Header upgrade (same reference)

* Make the header a floating, rounded white bar (24px radius, soft shadow, 12px from the top). It stays at the top while scrolling and becomes more compact after 80px.
* Nav: Home · Products ▾ (the 8 categories) · Collections ▾ (the 5 collections) · Brands ▾ (all brands with small logos) · Catalogues · About · Contact.
   * Dropdowns open on hover and on click, and work with the keyboard.
   * On mobile they become an accordion inside a full-screen menu.
* Right side:
   * a search button that opens a quick search over categories, collections, brands and catalogues, all searched in the browser from the content data;
   * social icons, hidden when the admin hasn't set a link;
   * a yellow pill button "Order on WhatsApp".
* The Yamuna Enterprises lockup under the logo stays.

4. "Send enquiry" from every category card ("What we stock")
Each of the 8 category cards (Notebooks and registers, Diaries and planners, Billing rolls, Files and folders, Photo paper and cartridges, Computer and IT peripherals, School stationery, Office stationery) must lead straight to an enquiry.
On the card

* Make the whole card one clickable `<button>` with an accessible name like "Send enquiry for Billing rolls". Don't nest links inside it.
* On hover and keyboard focus: the card lifts 2px, the border turns Navy, and a small Navy pill "Send enquiry →" appears in the card's bottom-right corner.
* On touch screens there is no hover, so show that pill all the time.
* Use the existing visible focus ring.

What opens

* Desktop: a centred dialog, 520px wide. Phones: a bottom sheet that slides up, with a drag handle, at most 90% of the screen height.
* Use a real `<dialog>` (or an equivalent with `role="dialog"` and `aria-modal="true"`) that traps focus, closes on Esc, on a backdrop click and on the ✕ button, and returns focus to the card that opened it.
* The page behind it does not scroll while it is open.
* Header: the category's illustration (small), the title "Enquire about <Category>" and a one-line hint: "Tell us what you need. We reply with rates, usually within a day." Only use "within a day" if I confirm it. Otherwise say "We'll get back to you soon".
* Two choices, side by side, the same size:
   1. "Send enquiry" (Navy, primary). It opens a short form inside the same dialog:
      * Name (required)
      * WhatsApp number (required, 10-digit Indian mobile)
      * I am a… (Parent or student / Retailer / School, college or class / Company or bank / Other)
      * Product details and quantity (optional textarea), with a category-specific placeholder, for example:
         * Billing rolls: "e.g. 79mm thermal rolls, 50 pieces"
         * Notebooks: "e.g. 200-page long books, 100 pieces"
      * Upload a list (optional): same file types, size limits and safety rules as section 2, but at most 2 files here
      * Consent checkbox (required)
      * Turnstile and a honeypot field
      * Submitting creates a normal enquiry, with `source = "category_card"` and `category = <slug>`. It goes through the same parsing as section 2 and appears in the admin inbox with a category tag. Show the success state in the dialog, with the reference number and a secondary "Also message us on WhatsApp" button pre-filled with that reference.
   2. "Chat on WhatsApp" (green). It opens wa.me/918999126686 with this message pre-filled in the current language: "Hi, I'm interested in <Category>. Please share rates and availability."
* Also show a small text link: "View catalogues for this category". It goes to `/catalogues`, filtered to the brands linked to that category; link brands to categories in the admin.
* Keep what the visitor typed if they close the dialog and reopen the same category in the same session. Clear it after a successful submit.
* Each category has its own shareable URL hash (`#enquire-billing-rolls`) that opens the dialog directly. This is useful for WhatsApp status posts and QR codes.
* Every string in EN, HI and MR.

Analytics and admin

* New events: `category_card_open` (with the category), `category_enquiry_submitted` and `category_whatsapp_click`. Add them to the tracker in section 1.
* Dashboard: add a "Interest by category" bar chart (opens, enquiries, WhatsApp clicks for each category), plus a filter in the enquiries inbox: Source = Category card / Bulk page / Collections.
* In the admin, under Categories: a per-category on/off switch for the enquiry dialog, editable placeholder text and a list of linked brands.

When done

1. Run the migrations against a local Supabase (`supabase start`), seed it, and check every flow end to end:
   * submit an enquiry with one `.xlsx`, one `.docx` and one photo;
   * click each category card, send one enquiry through the dialog and one through WhatsApp, and confirm both show up (in the inbox and in the "Interest by category" chart), on desktop and on a phone-sized screen;
   * in the admin, confirm the combined list, merge duplicates, export the Excel and PDF quotations, and change the status;
   * confirm the dashboard numbers move.
2. Write tests:
   * unit tests for the Excel, Word and PDF parsers, using fixture files in English and in Hindi/Marathi headers, including a messy sheet with merged cells and a totals row;
   * tests that check RLS stops a public user from reading enquiries or events.
3. Check the public pages at 360px, 768px and 1280px in all three languages, and keep Lighthouse mobile at 95+ on the home page.
4. Update `README.md` (how to run, how to add an admin, how to edit content) and `DEPLOY.md` (hosting choice, environment variables, Supabase set-up, backups, the keep-alive, costs).
5. Give me a short list of anything I still need to provide or decide: the hosting plan, email service, Turnstile keys, collection photos and catalogue PDFs.
