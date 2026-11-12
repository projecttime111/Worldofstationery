-- World of Stationery · round 3 · admin sign-in
-- Passwords, one-time setup links, sessions and login rate limits, all in this database
-- (no outside login service). Used by lib/admin/auth.ts.
--
-- A third limited role, web_auth, is used only by the sign-in code: it can check a
-- password and manage sessions, and nothing else. web_admin can never read password hashes.

do $$
begin
  if not exists (select from pg_roles where rolname = 'web_auth') then
    create role web_auth nologin;
  end if;
  execute format('grant web_auth to %I', current_user);
end $$;

grant usage on schema public to web_auth;

-- ── Passwords and setup links on admin_users ───────────────────────────────

alter table public.admin_users
  add column password_hash    text,         -- scrypt, see lib/admin/password.ts
  add column setup_token_hash text,         -- sha256 of the one-time setup link's token
  add column setup_expires_at timestamptz,
  add column last_login_at    timestamptz;

-- web_admin (owners managing admins) may see and change everything except the password hash.
revoke all on public.admin_users from web_admin;
grant select (email, role, display_name, created_at, created_by, setup_expires_at, last_login_at)
  on public.admin_users to web_admin;
grant insert (email, role, display_name, created_by, setup_token_hash, setup_expires_at)
  on public.admin_users to web_admin;
grant update (role, display_name, setup_token_hash, setup_expires_at)
  on public.admin_users to web_admin;
grant delete on public.admin_users to web_admin;

-- web_auth (the sign-in code) checks passwords and sets them through a setup link.
grant select (email, role, display_name, password_hash, setup_token_hash, setup_expires_at)
  on public.admin_users to web_auth;
grant update (password_hash, setup_token_hash, setup_expires_at, last_login_at)
  on public.admin_users to web_auth;
create policy "sign-in reads admins" on public.admin_users
  for select to web_auth using (true);
create policy "sign-in sets passwords and login time" on public.admin_users
  for update to web_auth using (true) with check (true);

-- ── Sessions ────────────────────────────────────────────────────────────────

create table public.admin_sessions (
  token_hash text primary key,              -- sha256 of the cookie value; the cookie itself is never stored
  email      text not null references public.admin_users (email) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,          -- 12 hours after sign-in
  user_agent text not null default ''
);
create index admin_sessions_email on public.admin_sessions (email);
create index admin_sessions_expires on public.admin_sessions (expires_at);

alter table public.admin_sessions enable row level security;
grant select, insert, delete on public.admin_sessions to web_auth;
create policy "sign-in manages sessions" on public.admin_sessions
  for all to web_auth using (true) with check (true);

-- ── Login attempts (rate limiting) ──────────────────────────────────────────

create table public.login_attempts (
  id      bigint generated always as identity primary key,
  key     text not null,                    -- 'email:<sha256>' or 'ip:<sha256>', never the raw value
  at      timestamptz not null default now(),
  success boolean not null
);
create index login_attempts_key_at on public.login_attempts (key, at desc);

alter table public.login_attempts enable row level security;
grant select, insert, delete on public.login_attempts to web_auth;
create policy "sign-in records attempts" on public.login_attempts
  for all to web_auth using (true) with check (true);

-- ── Keep secrets out of the audit log ───────────────────────────────────────

create or replace function public.audit_row() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  key text := '';
  col text;
  secret text[] := array['password_hash', 'setup_token_hash'];
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
    case when tg_op = 'INSERT' then null else to_jsonb(old) - secret end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) - secret end
  );
  return coalesce(new, old);
end $$;

-- Signing in and setting a password are not content changes: audit only who is an admin and their role.
drop trigger audit on public.admin_users;
create trigger audit after insert or delete or update of email, role, display_name on public.admin_users
  for each row execute function public.audit_row('email');
