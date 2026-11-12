// Applies the SQL files in db/migrations/ to the Neon database, in name order, once each.
//   npm run db:migrate          apply new migrations
//   npm run db:migrate -- --seed   also run db/seed.sql (only adds missing rows)
//
// Uses MIGRATION_DATABASE_URL if set (the database owner's connection), else DATABASE_URL.
// Both are read from .env.local. Each file runs in its own transaction: a failing file
// changes nothing and stops the run.
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = globalThis.WebSocket;

const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("db:migrate: set DATABASE_URL (or MIGRATION_DATABASE_URL) in .env.local first. See .env.example.");
  process.exit(1);
}

const dir = fileURLToPath(new URL("../db/migrations/", import.meta.url));
const pool = new Pool({ connectionString: url });
const client = await pool.connect();

try {
  await client.query(
    "create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const done = new Set((await client.query("select name from public.schema_migrations")).rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await readFile(dir + file, "utf8");
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`applied  ${file}`);
    } catch (error) {
      await client.query("rollback");
      console.error(`FAILED   ${file}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }
  if (process.exitCode !== 1) console.log("migrations up to date");

  if (process.exitCode !== 1 && process.argv.includes("--seed")) {
    const seed = await readFile(fileURLToPath(new URL("../db/seed.sql", import.meta.url)), "utf8");
    await client.query("begin");
    await client.query(seed);
    await client.query("commit");
    console.log("seed applied (missing rows only)");
  }
} finally {
  client.release();
  await pool.end();
}
