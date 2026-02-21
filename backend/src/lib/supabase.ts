import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Use Service Role Key for backend to bypass RLS when necessary
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY 
);