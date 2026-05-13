import { createBrowserClient } from '@supabase/ssr';

// Singleton — reuse the same Supabase client across the entire app.
// createBrowserClient from @supabase/ssr already handles this internally
// by caching based on the URL + key, but we make it explicit here to
// avoid any overhead of repeated calls.
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
