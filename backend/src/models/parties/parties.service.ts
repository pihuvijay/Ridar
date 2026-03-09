import { supabaseAdmin } from "../../lib/supabase";
import { env } from "../../config/env";
import { Party, LocationPoint } from "./parties.types";

// In-memory store used when MOCK_PARTIES=true (no Supabase table needed)
const mockPartiesStore = new Map<string, Party>();

function generateId(): string {
  return "mock-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

export const partiesService = {
  async createParty(
    leaderUserId: string,
    params: {
      name: string;
      maxMembers: number;
      pickup: LocationPoint;
      destination: LocationPoint;
      leaveBy?: string | null;
    }
  ): Promise<Party> {
    const { name, maxMembers, pickup, destination, leaveBy } = params;

    if (env.MOCK_PARTIES) {
      const party: Party = {
        id: generateId(),
        leaderUserId,
        name,
        maxMembers,
        currentMembers: 1,
        pickup: { ...pickup },
        destination: { ...destination },
        leaveBy: leaveBy ?? null,
        status: "open",
      };
      mockPartiesStore.set(party.id, party);
      return party;
    }

    // TODO: replace "parties" and column names with actual Supabase schema later
    const { data, error } = await supabaseAdmin
      .from("parties")
      .insert({
        leader_user_id: leaderUserId,
        name,
        max_members: maxMembers,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_label: pickup.label,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        destination_label: destination.label,
        leave_by: leaveBy ?? null,
        status: "open",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create party: ${error?.message ?? "Unknown error"}`);
    }

    return {
      id: data.party_id,
      leaderUserId: data.leader_user_id,
      name: data.name,
      maxMembers: data.max_members,
      currentMembers: data.current_members ?? 1,
      pickup: {
        lat: data.pickup_lat,
        lng: data.pickup_lng,
        label: data.pickup_label,
      },
      destination: {
        lat: data.destination_lat,
        lng: data.destination_lng,
        label: data.destination_label,
      },
      leaveBy: data.leave_by,
      status: data.status,
    };
  },

  async getParty(partyId: string): Promise<Party | null> {
    if (env.MOCK_PARTIES) {
      return mockPartiesStore.get(partyId) ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from("parties")
      .select("*")
      .eq("party_id", partyId)
      .single();

    if (error && error.code !== "PGRST116") {
      // 116 = no rows found, depending on Supabase version
      throw new Error(`Failed to fetch party: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.party_id,
      leaderUserId: data.leader_user_id,
      name: data.name,
      maxMembers: data.max_members,
      currentMembers: data.current_members,
      pickup: {
        lat: data.pickup_lat,
        lng: data.pickup_lng,
        label: data.pickup_label,
      },
      destination: {
        lat: data.destination_lat,
        lng: data.destination_lng,
        label: data.destination_label,
      },
      leaveBy: data.leave_by,
      status: data.status,
    };
  },

  async updatePartyLocations(
    partyId: string,
    updates: { pickup?: LocationPoint; destination?: LocationPoint }
  ): Promise<Party> {
    if (env.MOCK_PARTIES) {
      const existing = mockPartiesStore.get(partyId);
      if (!existing) throw new Error("Party not found");
      const updated: Party = {
        ...existing,
        pickup: updates.pickup ?? existing.pickup,
        destination: updates.destination ?? existing.destination,
      };
      mockPartiesStore.set(partyId, updated);
      return updated;
    }

    const payload: Record<string, unknown> = {};

    if (updates.pickup) {
      payload.pickup_lat = updates.pickup.lat;
      payload.pickup_lng = updates.pickup.lng;
      payload.pickup_label = updates.pickup.label;
    }

    if (updates.destination) {
      payload.destination_lat = updates.destination.lat;
      payload.destination_lng = updates.destination.lng;
      payload.destination_label = updates.destination.label;
    }

    const { data, error } = await supabaseAdmin
      .from("parties")
      .update(payload)
      .eq("party_id", partyId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update party locations: ${error?.message ?? "Unknown error"}`);
    }

    return {
      id: data.party_id,
      leaderUserId: data.leader_user_id,
      name: data.name,
      maxMembers: data.max_members,
      currentMembers: data.current_members,
      pickup: {
        lat: data.pickup_lat,
        lng: data.pickup_lng,
        label: data.pickup_label,
      },
      destination: {
        lat: data.destination_lat,
        lng: data.destination_lng,
        label: data.destination_label,
      },
      leaveBy: data.leave_by,
      status: data.status,
    };
  },
};