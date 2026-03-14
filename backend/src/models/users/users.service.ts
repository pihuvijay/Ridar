import { supabaseAdmin } from "../../lib/supabase";

export async function getOrCreateProfile(user: { id: string; email?: string | null }) {
  // try get
  const { data: existing, error: selErr } = await supabaseAdmin()
    .from("profiles")
    .select("id,email,full_name,avatar_url,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing;

  // create
  const { data: created, error: insErr } = await supabaseAdmin()
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
    })
    .select("id,email,full_name,avatar_url,created_at,updated_at")
    .single();

  if (insErr) throw insErr;
  return created;
}

export async function updateMyProfile(userId: string, patch: { full_name?: string; avatar_url?: string }) {
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id,email,full_name,avatar_url,created_at,updated_at")
    .single();

  if (error) throw error;
  return data;
}