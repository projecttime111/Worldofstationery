import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Server-side client with the public key, for reading published content.
 * It has exactly the rights an anonymous visitor has (see supabase/migrations).
 * Next.js caching is handled by lib/content.ts, so the requests themselves are not cached.
 */
export function publicClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
