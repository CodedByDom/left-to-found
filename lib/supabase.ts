import { createClient } from "@supabase/supabase-js";

// Public client (browser-safe, uses anon key + RLS)
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Public server client for read-only archive queries
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options = {}) =>
          fetch(url, {
            ...options,
            cache: "no-store",
          }),
      },
    }
  );
}
