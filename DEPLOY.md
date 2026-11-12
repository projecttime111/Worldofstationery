# Deploying World of Stationery

> **Changing in round 3.** The site is no longer a static export: it is a Next.js server app with an optional Neon Postgres database (plan in `docs/PLAN-v3.md`). The hosting choice is still open: Vercel's free Hobby plan does not allow commercial use, so a business site needs Vercel Pro or another host. A comparison with current prices and terms will replace this page, and nothing is set up until the owner chooses. The static-site steps further down no longer apply as written.

## Vercel: what the server version needs

- Import the GitHub repository as before; Vercel detects Next.js. No `vercel.json` is needed (the `/` → `/en/` redirect is in `next.config.ts`).
- Environment variables (Project > Settings > Environment Variables, for Production, Preview and Development):

  | Name | Value |
  | --- | --- |
  | `DATABASE_URL` | the Neon **pooled** connection string (Neon > Connect), the same one as in `.env.local` |
  | `SITE_URL` | the site's address with no slash at the end, e.g. `https://worldofstationery.vercel.app`, later your own domain |

  Nothing else is needed: admin sign-in keeps its sessions in the database. Never add the database address to a `NEXT_PUBLIC_` variable, and redeploy after changing a variable.
- In **Settings > Functions**, set the region to **Singapore (`sin1`)**, the same region as the Neon database (`ap-southeast-1`), so pages and the admin console that talk to the database stay fast.
- After the first deploy, open `https://your-site-address/admin/` and sign in. Setup links made on this computer with `npm run admin:invite` work on the live site too (same database) if you give the live address as the last argument.

## Neon (database) set-up

Only needed once the owner decides to switch the database on.

*Done for this site on 12 November 2026: database `worldofstationery` in Neon's Singapore region, migrations 0001–0002 applied and seeded. Kept here for a fresh set-up.*

1. Create a free account at https://neon.tech and a project in the Asia Pacific region closest to India. (Or add Neon from Vercel's **Storage / Marketplace** tab, which creates the project and sets `DATABASE_URL` in Vercel for you.)
2. In the project's **Connect** dialog, copy the **pooled** connection string. Put it in `.env.local` on this computer as `DATABASE_URL` (see `.env.example`), and in Vercel's environment variables.
3. On this computer, run:

```bash
npm run db:migrate -- --seed
```

   It creates the tables, the two limited roles (`web_anon` for visitors, `web_admin` for admins) and the access rules, then adds today's content.
4. Add the first owner and get their setup link:

```bash
npm run admin:invite -- owner-email@example.com owner "Name" https://your-site-address
```

5. Run `npm run build` (or redeploy on Vercel): the pages are now built from the database.

**Optional, safer:** in Neon's **Roles** page, create a login role for the site (for example `wos_app`), then in the SQL Editor run `grant web_anon, web_admin to wos_app;` and use that role's connection string as `DATABASE_URL`. Keep the owner's connection string only in `MIGRATION_DATABASE_URL` on this computer, for migrations. The site's own login can then never change the table structure.

The free plan scales the database to zero when idle and wakes it on the next request, so no keep-alive is needed. Its restore history is short, so round 3 adds a weekly CSV backup (phase 6).

## Static-site steps (round 2, kept for reference)

### 1. Put the project on GitHub

1. Create a free account at https://github.com if you do not have one.
2. Create a new **private** repository, for example `world-of-stationery`. Do not add a README or licence.
3. In this folder, run (replace `YOUR-NAME`):

```bash
git remote add origin https://github.com/YOUR-NAME/world-of-stationery.git
```

```bash
git push -u origin main
```

### 2. Publish on Vercel (free)

1. Go to https://vercel.com and sign up with your GitHub account. Choose the **Hobby** (free) plan.
2. Click **Add New… > Project**, find `world-of-stationery`, and click **Import**.
3. Vercel detects Next.js. Leave the build settings as they are (build command `npm run build`, output is handled automatically).
4. Open **Environment Variables** and add:
   - Name: `SITE_URL`
   - Value: your final address, for example `https://www.your-domain.in` (no slash at the end). Until you have a domain, use the `https://….vercel.app` address Vercel gives you, and change it later.
5. Click **Deploy**. After a minute or two you get a link like `https://world-of-stationery.vercel.app`.
6. Open it and check `/en/`, `/hi/`, `/mr/` and the bulk page on your phone.

From now on, every `git push` to `main` publishes the new version by itself.

### 3. Connect your own domain

1. Buy the domain from any registrar (GoDaddy, Hostinger, BigRock, Namecheap and others). Check the spelling: **stationery** with an **e**.
2. In Vercel, open the project, then **Settings > Domains**, type the domain (for example `www.your-domain.in`), and click **Add**. Add the bare domain too (`your-domain.in`) and let Vercel redirect it to `www`.
3. Vercel shows the DNS records to create. At your registrar, open the domain's DNS settings and add exactly those records. Usually:
   - `A` record for `@` pointing to the IP Vercel shows
   - `CNAME` record for `www` pointing to the address Vercel shows
4. Wait until Vercel shows **Valid Configuration** (from a few minutes up to a day). HTTPS is set up for you, free.
5. Update `SITE_URL` in **Settings > Environment Variables** to the final domain, then **Deployments > … > Redeploy** so the sitemap and share links use it.
6. In Google Business Profile, set the website to the new address.

### Checks after each launch

- `https://your-domain/` goes to `/en/`
- `https://your-domain/sitemap.xml` and `/robots.txt` open
- Send the home page link to yourself on WhatsApp: the preview should show the logo image and title
- Fill in the bulk form on a phone: WhatsApp should open with the message ready

### Alternative: Cloudflare Pages (free)

1. At https://dash.cloudflare.com, open **Workers & Pages > Create > Pages > Connect to Git** and pick the repository.
2. Framework preset: **None**. Build command: `npm run build`. Output directory: `out`.
3. Under **Environment variables**, add `SITE_URL` (as above) and `NODE_VERSION` = `22`.
4. Deploy. The `/` to `/en/` redirect comes from `public/_redirects`.
5. Add your domain under **Custom domains**.
