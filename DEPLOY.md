# Deploying World of Stationery

> **Changing in round 3.** The site is no longer a static export: it is a Next.js server app with a Supabase database (plan in `docs/PLAN-v3.md`). The steps below were written for the static site. The hosting choice is still open: Vercel's free Hobby plan does not allow commercial use, so a business site needs another plan. A comparison with current prices and terms will replace this page, and nothing is set up until the owner chooses. The Cloudflare Pages steps at the end no longer apply as written.

## Supabase (database) set-up

Only needed once the owner decides to switch the database on.

1. Create a free account at https://supabase.com and a new project in the **Mumbai (ap-south-1)** region, close to Akola. Keep the database password somewhere safe.
2. In **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**. Admins are invited from the console, nobody signs up.
3. In the **SQL Editor**, run each file in `supabase/migrations/` in name order, then `supabase/seed.sql`.
4. Still in the SQL Editor, add the first owner (their real email address):

```sql
insert into public.admin_users (email, role, display_name) values ('owner@example.com', 'owner', 'Name');
```

5. In **Project Settings > API**, copy the project URL and the publishable (anon) key into `.env.local` (and later the host's environment settings) as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The service-role key is secret: it goes only into `SUPABASE_SERVICE_ROLE_KEY` on the server, never into a `NEXT_PUBLIC_` variable or into git.
6. Run `npm run build`: the pages are now built from the database.

The free plan pauses a project after a week without activity and has no automatic backups. A daily keep-alive and a weekly CSV backup are part of round 3 (phases 6 and 7).

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
