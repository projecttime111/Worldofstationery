/**
 * Supabase settings from the environment (.env.local on this PC, the host's settings in production).
 * The publishable (anon) key is safe in the browser: Row Level Security decides what it can do.
 * The service-role key bypasses those rules, so it is read only in server-only files.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until Supabase is set up; the site then runs on the bundled content files. */
export const supabaseConfigured = () => Boolean(supabaseUrl && supabasePublishableKey);
