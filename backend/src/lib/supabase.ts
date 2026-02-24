import { createClient, QueryData, QueryResult, QueryError } from "@supabase/supabase-js";
import { env } from "../config";

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data, error } = await supabaseAdmin
  .from("rides")
  .select()

console.log(data);