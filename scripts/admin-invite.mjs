// Adds an admin (or gives an existing one a new setup link) straight in the database.
// Needed once, for the first owner; after that, owners add admins in the console (Admin users).
//
//   npm run admin:invite -- you@example.com owner "Your name" https://your-site.vercel.app
//
// Arguments: email, role (owner or staff, default owner), name (optional), site address
// (default http://localhost:3000). Prints a one-time setup link, valid 7 days, where the
// person chooses their own password. Reads DATABASE_URL (or MIGRATION_DATABASE_URL) from .env.local.
import { createHash, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const [rawEmail, role = "owner", name = "", base = "http://localhost:3000"] = process.argv.slice(2);
const email = (rawEmail ?? "").trim().toLowerCase();
const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  console.error("admin:invite: set DATABASE_URL in .env.local first.");
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !["owner", "staff"].includes(role)) {
  console.error('Usage: npm run admin:invite -- email [owner|staff] ["Name"] [https://site-address]');
  process.exit(1);
}

const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");
const sql = neon(url);

await sql`
  insert into public.admin_users (email, role, display_name, created_by, setup_token_hash, setup_expires_at)
  values (${email}, ${role}, ${name}, 'admin:invite script', ${hash}, now() + interval '7 days')
  on conflict (email) do update
    set setup_token_hash = excluded.setup_token_hash, setup_expires_at = excluded.setup_expires_at`;

console.log(`\n${email} is an admin (${role}). Setup link, valid 7 days, works once:\n`);
console.log(`${base.replace(/\/$/, "")}/admin/setup/?token=${token}\n`);
