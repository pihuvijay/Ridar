"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partiesService = void 0;
const supabase_1 = require("../../lib/supabase");
const env_1 = require("../../config/env");
// In-memory store used when MOCK_PARTIES=true (no Supabase table needed)
const mockPartiesStore = new Map();
// track which users have joined each mock ride
const mockPartyRiders = new Map();
function generateId() {
    return "mock-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}
exports.partiesService = {
    async createParty(leaderUserId, params) {
        const { name, maxMembers, pickup, destination, leaveBy } = params;
        if (env_1.env.MOCK_PARTIES) {
            const party = {
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
        // the actual table is called "rides" in the database; column names mirror the design doc
        const { data, error } = await supabase_1.supabaseAdmin
            .from("rides")
            .insert({
            creator_user_id: leaderUserId,
            name,
            max_riders: maxMembers,
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            pickup_label: pickup.label,
            destination_lat: destination.lat,
            destination_lng: destination.lng,
            destination_label: destination.label,
            departure_time: leaveBy ?? null,
            ride_status: "pending",
        })
            .select()
            .single();
        if (error || !data) {
            throw new Error(`Failed to create party: ${error?.message ?? "Unknown error"}`);
        }
        return {
            id: data.ride_id,
            leaderUserId: data.creator_user_id,
            name: data.name,
            maxMembers: data.max_riders,
            currentMembers: data.current_riders ?? 1,
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
            leaveBy: data.departure_time,
            status: data.ride_status,
        };
    },
    async getParty(partyId) {
        if (env_1.env.MOCK_PARTIES) {
            return mockPartiesStore.get(partyId) ?? null;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from("rides")
            .select("*")
            .eq("ride_id", partyId)
            .single();
        if (error && error.code !== "PGRST116") {
            // 116 = no rows found, depending on Supabase version
            throw new Error(`Failed to fetch party: ${error.message}`);
        }
        if (!data)
            return null;
        return {
            id: data.ride_id,
            leaderUserId: data.creator_user_id,
            name: data.name,
            maxMembers: data.max_riders,
            currentMembers: data.current_riders,
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
            leaveBy: data.departure_time,
            status: data.ride_status,
        };
    },
    async updatePartyLocations(partyId, updates) {
        if (env_1.env.MOCK_PARTIES) {
            const existing = mockPartiesStore.get(partyId);
            if (!existing)
                throw new Error("Party not found");
            const updated = {
                ...existing,
                pickup: updates.pickup ?? existing.pickup,
                destination: updates.destination ?? existing.destination,
            };
            mockPartiesStore.set(partyId, updated);
            return updated;
        }
        const payload = {};
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
        const { data, error } = await supabase_1.supabaseAdmin
            .from("rides")
            .update(payload)
            .eq("ride_id", partyId)
            .select()
            .single();
        if (error || !data) {
            throw new Error(`Failed to update party locations: ${error?.message ?? "Unknown error"}`);
        }
        return {
            id: data.ride_id,
            leaderUserId: data.creator_user_id,
            name: data.name,
            maxMembers: data.max_riders,
            currentMembers: data.current_riders,
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
            leaveBy: data.departure_time,
            status: data.ride_status,
        };
    },
    async joinParty(rideId, userId, options = {}) {
        if (env_1.env.MOCK_PARTIES) {
            let riders = mockPartyRiders.get(rideId);
            if (!riders) {
                riders = new Set();
                mockPartyRiders.set(rideId, riders);
            }
            riders.add(userId);
            // also increment the mock party's currentMembers if present
            const party = mockPartiesStore.get(rideId);
            if (party) {
                party.currentMembers += 1;
                mockPartiesStore.set(rideId, party);
            }
            return {
                rideId,
                userId,
                dropoff: options.dropoff ?? null,
                status: options.status ?? "pending",
            };
        }
        const payload = {
            ride_id: rideId,
            user_id: userId,
            status: options.status ?? "pending",
        };
        if (options.dropoff) {
            payload.dropoff_lat = options.dropoff.lat;
            payload.dropoff_lng = options.dropoff.lng;
            payload.dropoff_label = options.dropoff.label;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from("user_rides")
            .insert(payload)
            .select()
            .single();
        if (error || !data) {
            throw new Error(`Failed to join ride: ${error?.message ?? "Unknown error"}`);
        }
        // bump counter on the rides row so current_riders stays accurate
        try {
            const { data: rideData } = await supabase_1.supabaseAdmin
                .from("rides")
                .select("current_riders")
                .eq("ride_id", rideId)
                .single();
            if (rideData) {
                await supabase_1.supabaseAdmin
                    .from("rides")
                    .update({ current_riders: rideData.current_riders + 1 })
                    .eq("ride_id", rideId);
            }
        }
        catch {
            // swallow – the join itself succeeded, count is optional
        }
        return {
            rideId: data.ride_id,
            userId: data.user_id,
            dropoff: data.dropoff_lat
                ? { lat: data.dropoff_lat, lng: data.dropoff_lng, label: data.dropoff_label }
                : null,
            status: data.status,
        };
    },
};
