import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { asAuth, databaseConfigured } from "../db";
import { hashPassword, randomToken, sha256, verifyPassword } from "./crypto";

/**
 * Admin sign-in, kept entirely in our own database (migration 0002):
 *   - email + password (scrypt), only for emails listed in admin_users;
 *   - a random session token in an httpOnly cookie; the database keeps only its sha256;
 *   - sessions end 12 hours after sign-in;
 *   - at most 5 failed attempts per email and 20 per network address in 15 minutes.
 * New admins set their password through a one-time setup link (valid 7 days).
 */

export const SESSION_COOKIE = "wos_admin";
export const SESSION_HOURS = 12;
export const SETUP_LINK_DAYS = 7;
export const MIN_PASSWORD = 10;

export type Admin = { email: string; role: "owner" | "staff"; displayName: string };

async function clientKeys(email?: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return {
    ip: `ip:${sha256(ip)}`,
    email: email ? `email:${sha256(email)}` : null,
    userAgent: (h.get("user-agent") ?? "").slice(0, 200),
  };
}

/** The signed-in admin for this request, or null. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [rows] = await asAuth((tx) => [
    tx`select a.email, a.role, a.display_name
       from public.admin_sessions s join public.admin_users a on a.email = s.email
       where s.token_hash = ${sha256(token)} and s.expires_at > now()`,
  ]);
  const row = rows[0];
  return row ? { email: String(row.email), role: row.role as Admin["role"], displayName: String(row.display_name ?? "") } : null;
});

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login/");
  return admin;
}

export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin/");
  return admin;
}

async function startSession(email: string, userAgent: string) {
  const token = randomToken();
  await asAuth((tx) => [
    tx`delete from public.admin_sessions where expires_at < now()`,
    tx`insert into public.admin_sessions (token_hash, email, expires_at, user_agent)
       values (${sha256(token)}, ${email}, now() + make_interval(hours => ${SESSION_HOURS}), ${userAgent})`,
    tx`update public.admin_users set last_login_at = now() where email = ${email}`,
  ]);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_HOURS * 3600,
  });
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signIn(rawEmail: string, password: string): Promise<SignInResult> {
  if (!databaseConfigured()) return { ok: false, error: "The database is not connected yet (DATABASE_URL is missing)." };
  const email = rawEmail.trim().toLowerCase();
  const keys = await clientKeys(email);

  const [[counts]] = await asAuth((tx) => [
    tx`select
         count(*) filter (where key = ${keys.email} and not success)::int as by_email,
         count(*) filter (where key = ${keys.ip} and not success)::int as by_ip
       from public.login_attempts
       where at > now() - interval '15 minutes' and key in (${keys.email}, ${keys.ip})`,
  ]);
  if (Number(counts?.by_email) >= 5 || Number(counts?.by_ip) >= 20) {
    return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const [rows] = await asAuth((tx) => [tx`select email, password_hash from public.admin_users where email = ${email}`]);
  const stored = (rows[0]?.password_hash as string | null | undefined) ?? null;
  const ok = await verifyPassword(password, stored);

  await asAuth((tx) => [
    tx`delete from public.login_attempts where at < now() - interval '1 day'`,
    tx`insert into public.login_attempts (key, success) values (${keys.email}, ${ok}), (${keys.ip}, ${ok})`,
  ]);
  if (!ok) return { ok: false, error: "That email and password do not match." };

  await startSession(email, keys.userAgent);
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && databaseConfigured()) {
    await asAuth((tx) => [tx`delete from public.admin_sessions where token_hash = ${sha256(token)}`]);
  }
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** The admin a setup link belongs to, if the link is valid. */
export async function setupLinkOwner(token: string): Promise<string | null> {
  if (!token || !databaseConfigured()) return null;
  const [rows] = await asAuth((tx) => [
    tx`select email from public.admin_users where setup_token_hash = ${sha256(token)} and setup_expires_at > now()`,
  ]);
  return rows[0] ? String(rows[0].email) : null;
}

/** Sets the password from a setup link, ends the link, ends old sessions, and signs in. */
export async function completeSetup(token: string, password: string): Promise<SignInResult> {
  const email = await setupLinkOwner(token);
  if (!email) return { ok: false, error: "This setup link has expired or was already used. Ask an owner for a new one." };
  if (password.length < MIN_PASSWORD) return { ok: false, error: `Use at least ${MIN_PASSWORD} characters.` };
  const hash = await hashPassword(password);
  await asAuth((tx) => [
    tx`update public.admin_users
       set password_hash = ${hash}, setup_token_hash = null, setup_expires_at = null
       where email = ${email} and setup_token_hash = ${sha256(token)}`,
    tx`delete from public.admin_sessions where email = ${email}`,
  ]);
  await startSession(email, (await clientKeys()).userAgent);
  return { ok: true };
}

/** A new setup link: the token for the URL, and the hash and expiry to store. */
export function newSetupLink() {
  const token = randomToken();
  return { token, hash: sha256(token), expires: new Date(Date.now() + SETUP_LINK_DAYS * 86400_000).toISOString() };
}
