import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";

let _supabaseAuth: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAuth(): SupabaseClient {
	if (!_supabaseAuth) {
		_supabaseAuth = createClient(
			env.SUPABASE_URL,
			env.SUPABASE_ANON_KEY,
		);
	}
	return _supabaseAuth;
}

function getSupabaseAdmin(): SupabaseClient {
	if (!_supabaseAdmin) {
		_supabaseAdmin = createClient(
			env.SUPABASE_URL,
			env.SUPABASE_SERVICE_ROLE_KEY,
		);
	}
	return _supabaseAdmin;
}

export const supabaseAuth = getSupabaseAuth();
export const supabaseAdmin = getSupabaseAdmin();