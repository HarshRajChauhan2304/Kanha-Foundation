import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("Supabase URL or Anon Key is missing. Database requests will fail.");
}

// Client for public reading operations (RLS compliant)
export const supabase = (isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'then') return undefined; // Avoid blocking async checks
        return () => {
          throw new Error("Supabase public client is not configured. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
        };
      }
    })) as SupabaseClient;

// Admin client for backend writing/deleting (bypasses RLS)
export const supabaseAdmin = ((supabaseUrl && (supabaseServiceKey || supabaseAnonKey))
  ? createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
  : new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'then') return undefined; // Avoid blocking async checks
        return () => {
          throw new Error("Supabase admin client is not configured. Please check your SUPABASE_SERVICE_ROLE_KEY environment variable.");
        };
      }
    })) as SupabaseClient;


