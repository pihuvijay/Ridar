import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env"; // IMPORTANT: import env directly, not "../config"

let _supabaseAuth: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function supabaseAuth(): SupabaseClient {
  if (!_supabaseAuth) {
    _supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return _supabaseAuth;
}

export function supabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _supabaseAdmin;
}