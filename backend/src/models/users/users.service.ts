import { supabaseAdmin } from "../../lib/supabase";

export async function getOrCreateProfile(user: { id: string; email?: string | null }) {
  // try get
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,avatar_url,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing;

  // create
  const { data: created, error: insErr } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id,email,full_name,avatar_url,created_at,updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function rateUser(targetUserId: string, raterId: string, rating: number) {
  // Fetch existing rating aggregate from profiles
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("profiles")
    .select("id,rating,rating_count")
    .eq("id", targetUserId)
    .maybeSingle();

  if (selErr) throw selErr;

  const prevRating = (existing && typeof existing.rating === 'number') ? Number(existing.rating) : 0;
  const prevCount = (existing && typeof existing.rating_count === 'number') ? Number(existing.rating_count) : 0;

  const newCount = prevCount + 1;
  const newRating = prevCount === 0 ? rating : (prevRating * prevCount + rating) / newCount;

  const { data: updated, error: updErr } = await supabaseAdmin
    .from('profiles')
    .update({ rating: newRating, rating_count: newCount })
    .eq('id', targetUserId)
    .select('id,email,full_name,avatar_url,rating,rating_count')
    .single();

  if (updErr) throw updErr;

  return updated;
}