-- World of Stationery · round 3 · phase 1
-- Admin users, the site's editable content, settings, and the audit log.
--
-- Plain Postgres (Neon). The browser never talks to the database: the site's server code
-- connects and, inside each transaction, switches to one of two roles (lib/db.ts):
--   web_anon   for visitors;
--   web_admin  for a signed-in admin, with that admin's email in the setting app.user_email.
--
-- Access rules (Row Level Security is on for every table):
--   * Visitors (web_anon) may READ the published content tables: business, offers, brands,
--     categories, category_brands, text_overrides. Nothing else.
--   * Only admins (web_admin, email listed in admin_users) may CHANGE content.
--   * Only owners may manage admin_users and settings, and read the audit log.
--   * Every content change is written to audit_log with the old and new values.

-- ── Roles ───────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select from pg_roles where rolname = 'web_anon') then
    create role web_anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'web_admin') then
    create role web_admin nologin;
  end if;
  -- The role that runs this migration (the site's connection) may switch to both.
  execute format('grant web_anon, web_admin to %I', current_user);
end $$;

grant usage on schema public to web_anon, web_admin;

-- Email of the signed-in admin for this transaction, set by lib/db.ts. Null for visitors.
create function public.request_email() returns text
language sql stable set search_path = ''
as $$ select lower(nullif(current_setting('app.user_email', true), '')) $$;

-- ── Admin users and role helpers ────────────────────────────────────────────

create table public.admin_users (
  email        text primary key check (email = lower(email) and email like '%_@_%'),
  role         text not null check (role in ('owner', 'staff')),
  display_name text not null default '',
  created_at   timestamptz not null default now(),
  created_by   text
);

comment on table public.admin_users is
  'Who may sign in to /admin. owner: everything; staff: enquiries and content, not settings or users.';

-- Role of the signed-in user, or null for visitors and non-admins.
-- security definer: reads admin_users without needing (or granting) a select policy on it.
create function public.current_admin_role() returns text
language sql stable security definer set search_path = ''
as $$
  select a.role
  from public.admin_users a
  where a.email = public.request_email()
$$;
-- (Admin policies are granted only to web_admin, so a visitor transaction never reaches them.)

create function public.is_admin() returns boolean
language sql stable set search_path = ''
as $$ select public.current_admin_role() is not null $$;

create function public.is_owner() returns boolean
language sql stable set search_path = ''
as $$ select public.current_admin_role() = 'owner' $$;

-- Never leave the console without an owner.
create function public.keep_one_owner() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if (tg_op = 'DELETE' or new.role <> 'owner') and old.role = 'owner'
     and not exists (select 1 from public.admin_users where role = 'owner' and email <> old.email) then
    raise exception 'At least one owner must remain';
  end if;
  return coalesce(new, old);
end $$;

create trigger admin_users_keep_one_owner
  before update or delete on public.admin_users
  for each row execute function public.keep_one_owner();

alter table public.admin_users enable row level security;

create policy "admins see the admin list" on public.admin_users
  for select to web_admin using (public.is_admin());
create policy "owners add admins" on public.admin_users
  for insert to web_admin with check (public.is_owner());
create policy "owners change admins" on public.admin_users
  for update to web_admin using (public.is_owner()) with check (public.is_owner());
create policy "owners remove admins" on public.admin_users
  for delete to web_admin using (public.is_owner());

-- ── Shared triggers: who changed a row, and the audit log ───────────────────

create function public.stamp_row() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(public.request_email(), 'system');
  return new;
end $$;

create table public.audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      text not null,
  table_name text not null,
  row_key    text not null,
  action     text not null check (action in ('insert', 'update', 'delete')),
  old_value  jsonb,
  new_value  jsonb,
  rolled_back_by bigint references public.audit_log (id)
);

create index audit_log_at on public.audit_log (at desc);
create index audit_log_row on public.audit_log (table_name, row_key, at desc);

comment on table public.audit_log is
  'One row per content change, written by the audit_row trigger. Owners can read it and roll back a change.';

-- Trigger arguments are the key columns of the table, joined with ":" to name the row.
create function public.audit_row() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  key text := '';
  col text;
begin
  foreach col in array tg_argv loop
    key := key || case when key = '' then '' else ':' end || coalesce(rec ->> col, '');
  end loop;
  insert into public.audit_log (actor, table_name, row_key, action, old_value, new_value)
  values (
    coalesce(public.request_email(), 'system'),
    tg_table_name,
    key,
    lower(tg_op),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

alter table public.audit_log enable row level security;
create policy "owners read the audit log" on public.audit_log
  for select to web_admin using (public.is_owner());
-- No insert/update/delete policies: rows are written only by the audit_row trigger.

-- ── Business details (one row) ──────────────────────────────────────────────

create table public.business (
  id                  smallint primary key default 1 check (id = 1),
  phone_display       text not null check (phone_display <> ''),
  phone_international text not null check (phone_international <> ''),
  phone_tel           text not null check (phone_tel ~ '^\+[0-9]{8,15}$'),
  phone_whatsapp      text not null check (phone_whatsapp ~ '^[0-9]{8,15}$'),
  email               text not null check (email like '%_@_%'),
  gstin               text not null check (gstin ~ '^[0-9A-Z]{15}$'),
  street              text not null,
  locality            text not null,
  region              text not null,
  postal_code         text not null,
  country             text not null default 'IN',
  latitude            numeric(9, 6),
  longitude           numeric(9, 6),
  directions_url      text not null check (directions_url ~ '^https://'),
  maps_embed_url      text check (maps_embed_url is null or maps_embed_url ~ '^https://www\.google\.com/maps/embed'),
  opening_days        text[] not null,
  opens               text not null check (opens ~ '^[0-2][0-9]:[0-5][0-9]$'),
  closes              text not null check (closes ~ '^[0-2][0-9]:[0-5][0-9]$'),
  years_experience    integer not null check (years_experience between 0 and 200),
  -- Empty string = the icon is hidden.
  instagram_url       text not null default '' check (instagram_url = '' or instagram_url ~ '^https://'),
  facebook_url        text not null default '' check (facebook_url = '' or facebook_url ~ '^https://'),
  youtube_url         text not null default '' check (youtube_url = '' or youtube_url ~ '^https://'),
  updated_at          timestamptz not null default now(),
  updated_by          text not null default 'system'
);

-- ── Offers (one row) ────────────────────────────────────────────────────────

create table public.offers (
  id                   smallint primary key default 1 check (id = 1),
  enabled              boolean not null default false,
  start_date           text not null default '',
  end_date             text not null default '',
  bill_tier1_min       integer not null check (bill_tier1_min >= 0),
  bill_tier1_percent   integer not null check (bill_tier1_percent between 0 and 100),
  bill_tier2_min       integer not null check (bill_tier2_min >= 0),
  bill_tier2_percent   integer not null check (bill_tier2_percent between 0 and 100),
  gift_pack_value      integer not null check (gift_pack_value >= 0),
  refer_friend_saves   integer not null check (refer_friend_saves >= 0),
  refer_you_earn       integer not null check (refer_you_earn >= 0),
  refer_min_first_bill integer not null check (refer_min_first_bill >= 0),
  gold_visits          integer not null check (gold_visits >= 0),
  gold_yearly_spend    integer not null check (gold_yearly_spend >= 0),
  gold_extra_percent   integer not null check (gold_extra_percent between 0 and 100),
  updated_at           timestamptz not null default now(),
  updated_by           text not null default 'system'
);

-- ── Brands and their catalogues ─────────────────────────────────────────────

create table public.brands (
  slug              text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (name <> ''),
  logo_path         text check (logo_path is null or logo_path ~ '^(/|https://)'),
  logo_width        integer check (logo_width > 0),
  logo_height       integer check (logo_height > 0),
  -- key: top of the pyramid; row2 / row3: authorised brands; also: "We also deal in"; hidden: not shown.
  placement         text not null check (placement in ('key', 'row2', 'row3', 'also', 'hidden')),
  position          integer not null default 0,
  catalogue_pdf     text check (catalogue_pdf is null or catalogue_pdf ~ '^(/|https://)'),
  catalogue_updated text,
  -- What the brand supplies, per language. Empty = not shown.
  supplies_en       text not null default '',
  supplies_hi       text not null default '',
  supplies_mr       text not null default '',
  updated_at        timestamptz not null default now(),
  updated_by        text not null default 'system'
);

create unique index brands_one_key_partner on public.brands (placement) where placement = 'key';

-- ── "What we stock" categories ──────────────────────────────────────────────
-- Names and descriptions are site text (text_overrides); this table holds the picture.

create table public.categories (
  slug         text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position     integer not null,
  image_src    text not null check (image_src ~ '^(/|https://)'),
  image_width  integer not null check (image_width > 0),
  image_height integer not null check (image_height > 0),
  updated_at   timestamptz not null default now(),
  updated_by   text not null default 'system'
);

-- Which brands' catalogues belong to a category ("View catalogues for this category").
create table public.category_brands (
  category_slug text not null references public.categories (slug) on update cascade on delete cascade,
  brand_slug    text not null references public.brands (slug) on update cascade on delete cascade,
  updated_at    timestamptz not null default now(),
  updated_by    text not null default 'system',
  primary key (category_slug, brand_slug)
);

-- ── Site text edits ─────────────────────────────────────────────────────────
-- The texts are in content/<lang>.json. A row here replaces one text, e.g. ('hi', 'hero.title').

create table public.text_overrides (
  locale     text not null check (locale in ('en', 'hi', 'mr')),
  path       text not null check (path ~ '^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$'),
  value      text not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system',
  primary key (locale, path)
);

-- ── Settings (owner only) ───────────────────────────────────────────────────

create table public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);

-- ── Row Level Security for content and settings ─────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['business', 'offers', 'brands', 'categories', 'category_brands', 'text_overrides'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "anyone reads %1$s" on public.%1$I for select to web_anon, web_admin using (true)', t);
    execute format('create policy "admins add %1$s" on public.%1$I for insert to web_admin with check (public.is_admin())', t);
    execute format('create policy "admins change %1$s" on public.%1$I for update to web_admin using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admins remove %1$s" on public.%1$I for delete to web_admin using (public.is_admin())', t);
    execute format('grant select on public.%I to web_anon, web_admin', t);
    execute format('grant insert, update, delete on public.%I to web_admin', t);
  end loop;
end $$;

alter table public.settings enable row level security;
create policy "admins read settings" on public.settings
  for select to web_admin using (public.is_admin());
create policy "owners add settings" on public.settings
  for insert to web_admin with check (public.is_owner());
create policy "owners change settings" on public.settings
  for update to web_admin using (public.is_owner()) with check (public.is_owner());
create policy "owners remove settings" on public.settings
  for delete to web_admin using (public.is_owner());

-- Visitors get no rights at all on these three tables.
grant select, insert, update, delete on public.admin_users, public.settings to web_admin;
grant select on public.audit_log to web_admin;

-- ── Triggers ────────────────────────────────────────────────────────────────

create trigger stamp before update on public.business for each row execute function public.stamp_row();
create trigger stamp before update on public.offers for each row execute function public.stamp_row();
create trigger stamp before update on public.brands for each row execute function public.stamp_row();
create trigger stamp before update on public.categories for each row execute function public.stamp_row();
create trigger stamp before update on public.text_overrides for each row execute function public.stamp_row();
create trigger stamp before update on public.settings for each row execute function public.stamp_row();

create trigger audit after insert or update or delete on public.business for each row execute function public.audit_row('id');
create trigger audit after insert or update or delete on public.offers for each row execute function public.audit_row('id');
create trigger audit after insert or update or delete on public.brands for each row execute function public.audit_row('slug');
create trigger audit after insert or update or delete on public.categories for each row execute function public.audit_row('slug');
create trigger audit after insert or update or delete on public.category_brands for each row execute function public.audit_row('category_slug', 'brand_slug');
create trigger audit after insert or update or delete on public.text_overrides for each row execute function public.audit_row('locale', 'path');
create trigger audit after insert or update or delete on public.settings for each row execute function public.audit_row('key');
create trigger audit after insert or update or delete on public.admin_users for each row execute function public.audit_row('email');
