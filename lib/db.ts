import "server-only";
import { neon, type NeonQueryFunctionInTransaction, type NeonQueryInTransaction } from "@neondatabase/serverless";

/**
 * The Neon Postgres database. Only server code talks to it; the browser never does.
 *
 * Every query runs inside a transaction that first switches to a limited role, so the
 * database's Row Level Security rules apply (db/migrations):
 *   asVisitor()     role web_anon:  read published content only
 *   asAdmin(email)  role web_admin: what that admin's entry in admin_users allows
 *
 * DATABASE_URL is secret (it contains the password). It lives in .env.local and in the
 * host's settings, never in git and never in a NEXT_PUBLIC_ variable.
 */
const databaseUrl = process.env.DATABASE_URL ?? "";

/** False until a database is set up; the site then runs on the bundled content files. */
export const databaseConfigured = () => Boolean(databaseUrl);

type Tx = NeonQueryFunctionInTransaction<false, false>;
type Queries = (tx: Tx) => NeonQueryInTransaction[];

function client() {
  // Next.js caching is handled by the callers (lib/content.ts), so requests are not cached here.
  return neon(databaseUrl, { fetchOptions: { cache: "no-store" } });
}

/** Run queries as a visitor, in one read-only transaction. Returns each query's rows. */
export async function asVisitor(queries: Queries): Promise<Record<string, unknown>[][]> {
  const results = await client().transaction((tx) => [tx`set local role web_anon`, ...queries(tx)], { readOnly: true });
  return results.slice(1) as Record<string, unknown>[][];
}

/** Run queries as a signed-in admin, in one transaction. The email must be checked by the caller's login. */
export async function asAdmin(email: string, queries: Queries): Promise<Record<string, unknown>[][]> {
  const results = await client().transaction((tx) => [
    tx`set local role web_admin`,
    tx`select set_config('app.user_email', ${email.toLowerCase()}, true)`,
    ...queries(tx),
  ]);
  return results.slice(2) as Record<string, unknown>[][];
}
