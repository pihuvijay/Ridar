// backend/src/models/auth/auth.service.ts
import { supabaseAuth, supabaseAdmin } from "../../lib/supabase";

export async function register(email: string, password: string, p0: { fullName: string; courseMajor: string; age: number; gender: string; }) {
  // IMPORTANT: use Admin client so we can bypass email sending + confirm immediately
  const admin = supabaseAdmin();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  return data;
}

export async function login(email: string, password: string) {
  // normal sign-in uses anon client
  const supabase = supabaseAuth();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw Object.assign(new Error(error.message), { status: 401 });

  return data;
}

export async function verifyEmail(email: string) {
  const supabase = supabaseAuth();

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    // options: { emailRedirectTo: "yourapp://auth-callback" }, // optional later
  });

  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  return data;
}
