import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a placeholder client for build time, real client for runtime
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Placeholder for build time - will be replaced at runtime
  console.warn("Supabase environment variables not set - auth will not work");
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
}

export { supabase };

// Helper to get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Helper to get access token for API calls
export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}