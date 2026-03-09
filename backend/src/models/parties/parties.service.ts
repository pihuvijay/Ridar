import { supabaseAdmin } from "../../lib/supabase";
import type { Party } from "./parties.types";

const MOCK = process.env.MOCK_PARTIES === "true";

export async function listParties(userId: string): Promise<Party[]> {
  if (MOCK) {
    return [{ id: "mock-1", title: "Mock Party", date: "2026-03-02" }];
  }

  // Example table name: parties (you will create it in Supabase)
  const { data, error } = await supabaseAdmin
    .from("parties")
    .select("id,title,date")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  return (data ?? []) as Party[];
}

export async function createParty(userId: string, input: Omit<Party, "id">): Promise<Party> {
  if (MOCK) {
    return { id: "mock-created", ...input };
  }

  const { data, error } = await supabaseAdmin
    .from("parties")
    .insert([{ user_id: userId, ...input }])
    .select("id,title,date")
    .single();

  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return data as Party;
}