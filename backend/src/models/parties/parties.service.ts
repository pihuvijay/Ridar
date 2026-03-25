import { supabaseAdmin } from "../../lib/supabase";
import { env } from "../../config/env";
import { Party, LocationPoint } from "./parties.types";
import crypto from "crypto";

const mockPartiesStore = new Map<string, Party>();

// track which users have joined each mock ride
const mockPartyRiders = new Map<string, Set<string>>();

function generateId(): string {
	return (
		"mock-" +
		Date.now().toString(36) +
		"-" +
		Math.random().toString(36).slice(2, 9)
	);
}

function parseWktPoint(point: any): { lat: number; lng: number } | null {
	if (!point) return null;
	const s = typeof point === "string" ? point : point?.toString?.();
	if (!s) return null;
	const m = s.match(/POINT\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/);
	if (!m) return null;
	return { lat: parseFloat(m[2]), lng: parseFloat(m[1]) };
}

export const partiesService = {
	async listParties(_userId: string): Promise<Party[]> {
		if (env.MOCK_PARTIES) {
			return Array.from(mockPartiesStore.values()).filter((party) => {
				const isClosed =
					party.status === "closed" ||
					party.status === "completed" ||
					party.status === "full";

				const isExpired =
					party.leaveBy &&
					new Date(party.leaveBy).getTime() < Date.now();

				const isFull = party.currentMembers >= party.maxMembers;

				return !isClosed && !isExpired && !isFull;
			});
		}

		const { data, error } = await supabaseAdmin
			.from("rides")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(`Failed to list parties: ${error.message}`);
		}

		const visibleRows = (data ?? []).filter((row: any) => {
			const isClosed =
				row.ride_status === "closed" ||
				row.ride_status === "completed" ||
				row.ride_status === "full";

			const isExpired =
				row.departure_time &&
				new Date(row.departure_time).getTime() < Date.now();

			const isFull =
				typeof row.current_riders === "number" &&
				typeof row.max_riders === "number" &&
				row.current_riders >= row.max_riders;

			return !isClosed && !isExpired && !isFull;
		});

		const creatorIds = Array.from(
			new Set(
				visibleRows.map((r: any) => r.creator_user_id).filter(Boolean),
			),
		);

		let usersMap: Record<string, any> = {};
		if (creatorIds.length > 0) {
			const { data: users } = await supabaseAdmin
				.from("users")
				.select("user_id,name,email")
				.in("user_id", creatorIds as string[]);

			if (users && Array.isArray(users)) {
				usersMap = users.reduce(
					(acc: any, u: any) => {
						acc[u.user_id] = u;
						return acc;
					},
					{} as Record<string, any>,
				);
			}
		}

		return visibleRows.map((row: any) => {
			const pickupCoords = parseWktPoint(row.pickup_geog);
			const destCoords = parseWktPoint(row.destination_geog);

			const leaderUser = usersMap[row.creator_user_id];
			const leaderName =
				leaderUser?.name?.trim() || leaderUser?.email?.trim() || null;

			return {
				id: row.ride_id,
				leaderUserId: row.creator_user_id,
				leaderName,
				name: row.course ?? "Ride Group",
				maxMembers: row.max_riders,
				currentMembers: row.current_riders ?? 1,
				pricePerPerson:
					row.total_cost && row.max_riders
						? Number(row.total_cost) / row.max_riders
						: 0,
				pickup: {
					lat: pickupCoords?.lat ?? 0,
					lng: pickupCoords?.lng ?? 0,
					label: row.pickup_location ?? "",
				},
				pickupGeog: row.pickup_geog ?? null,
				destination: {
					lat: destCoords?.lat ?? 0,
					lng: destCoords?.lng ?? 0,
					label: row.destination ?? "",
				},
				destinationGeog: row.destination_geog ?? null,
				leaveBy: row.departure_time ?? null,
				status:
					row.ride_status === "pending" ? "open" : row.ride_status,
			} as Party;
		});
	},

	async createParty(
		leaderUserId: string,
		params: {
			name: string;
			maxMembers: number;
			pickup: LocationPoint;
			destination: LocationPoint;
			leaveBy?: string | null;
			pricePerPerson?: number;
		},
	): Promise<Party> {
		const {
			name,
			maxMembers,
			pickup,
			destination,
			leaveBy,
			pricePerPerson,
		} = params;

		if (env.MOCK_PARTIES) {
			const party: Party = {
				id: generateId(),
				leaderUserId,
				name,
				maxMembers,
				currentMembers: 1,
				pricePerPerson: pricePerPerson ?? 0,
				pickup: { ...pickup },
				destination: { ...destination },
				leaveBy: leaveBy ?? null,
				status: "open",
			};
			mockPartiesStore.set(party.id, party);
			return party;
		}

		const rideId = crypto.randomUUID();
		const pickPoint = `POINT(${pickup.lng} ${pickup.lat})`;
		const destPoint = `POINT(${destination.lng} ${destination.lat})`;

		const { data, error } = await supabaseAdmin
			.from("rides")
			.insert({
				ride_id: rideId,
				creator_user_id: leaderUserId,
				course: name,
				max_riders: maxMembers,
				current_riders: 1,
				pickup_location: pickup.label,
				pickup_geog: pickPoint,
				destination: destination.label,
				destination_geog: destPoint,
				departure_time: leaveBy ?? null,
				ride_status: "pending",
				total_cost: (pricePerPerson ?? 0) * maxMembers,
			})
			.select()
			.single();

		if (error || !data) {
			throw new Error(
				`Failed to create party: ${error?.message ?? "Unknown error"}`,
			);
		}

		// try to fetch leader display name from profiles
		let leaderName: string | null = null;
		try {
			const { data: profile } = await supabaseAdmin
				.from("profiles")
				.select("full_name,email")
				.eq("id", leaderUserId)
				.single();

			if (profile)
				leaderName = profile.full_name || profile.email || null;
		} catch {}

		return {
			id: data.ride_id,
			leaderUserId: data.creator_user_id,
			leaderName,
			name: data.course,
			maxMembers: data.max_riders,
			currentMembers: data.current_riders ?? 1,
			pricePerPerson:
				data.total_cost && data.max_riders
					? Number(data.total_cost) / data.max_riders
					: 0,
			pickup: { lat: pickup.lat, lng: pickup.lng, label: pickup.label },
			pickupGeog: data.pickup_geog ?? null,
			destination: {
				lat: destination.lat,
				lng: destination.lng,
				label: destination.label,
			},
			destinationGeog: data.destination_geog ?? null,
			leaveBy: data.departure_time ?? leaveBy ?? null,
			status: "open",
		};
	},

	async getParty(partyId: string): Promise<Party | null> {
		if (env.MOCK_PARTIES) {
			return mockPartiesStore.get(partyId) ?? null;
		}

		const { data, error } = await supabaseAdmin
			.from("rides")
			.select("*")
			.eq("ride_id", partyId)
			.single();

		if (error && error.code !== "PGRST116") {
			throw new Error(`Failed to fetch party: ${error.message}`);
		}

		if (!data) return null;

		const pickupCoords = parseWktPoint(data.pickup_geog);
		const destCoords = parseWktPoint(data.destination_geog);

		// try to fetch leader display name
		let leaderName: string | null = null;
		try {
			const { data: profile } = await supabaseAdmin
				.from("profiles")
				.select("full_name,email")
				.eq("id", data.creator_user_id)
				.single();

			if (profile)
				leaderName = profile.full_name || profile.email || null;
		} catch {}

		return {
			id: data.ride_id,
			leaderUserId: data.creator_user_id,
			name: data.course,
			leaderName,
			maxMembers: data.max_riders,
			currentMembers: data.current_riders,
			pricePerPerson:
				data.total_cost && data.max_riders
					? Number(data.total_cost) / data.max_riders
					: 0,
			pickup: {
				lat: pickupCoords?.lat ?? 0,
				lng: pickupCoords?.lng ?? 0,
				label: data.pickup_location ?? "",
			},
			pickupGeog: data.pickup_geog ?? null,
			destination: {
				lat: destCoords?.lat ?? 0,
				lng: destCoords?.lng ?? 0,
				label: data.destination ?? "",
			},
			destinationGeog: data.destination_geog ?? null,
			leaveBy: data.departure_time,
			status: data.ride_status === "pending" ? "open" : data.ride_status,
		};
	},

	async updatePartyLocations(
		partyId: string,
		updates: { pickup?: LocationPoint; destination?: LocationPoint },
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
			payload.pickup_location = updates.pickup.label;
			payload.pickup_geog = `POINT(${updates.pickup.lng} ${updates.pickup.lat})`;
		}

		if (updates.destination) {
			payload.destination = updates.destination.label;
			payload.destination_geog = `POINT(${updates.destination.lng} ${updates.destination.lat})`;
		}

		const { data, error } = await supabaseAdmin
			.from("rides")
			.update(payload)
			.eq("ride_id", partyId)
			.select()
			.single();

		if (error || !data) {
			throw new Error(
				`Failed to update party locations: ${error?.message ?? "Unknown error"}`,
			);
		}

		const updatedPickupCoords = parseWktPoint(data.pickup_geog);
		const updatedDestCoords = parseWktPoint(data.destination_geog);

		// try to fetch leader display name
		let leaderName: string | null = null;
		try {
			const { data: profile } = await supabaseAdmin
				.from("profiles")
				.select("full_name,email")
				.eq("id", data.creator_user_id)
				.single();

			if (profile)
				leaderName = profile.full_name || profile.email || null;
		} catch {}

		return {
			id: data.ride_id,
			leaderUserId: data.creator_user_id,
			leaderName,
			name: data.course,
			maxMembers: data.max_riders,
			currentMembers: data.current_riders,
			pricePerPerson:
				data.total_cost && data.max_riders
					? Number(data.total_cost) / data.max_riders
					: 0,
			pickup: {
				lat: updatedPickupCoords?.lat ?? 0,
				lng: updatedPickupCoords?.lng ?? 0,
				label: data.pickup_location ?? "",
			},
			pickupGeog: data.pickup_geog ?? null,
			destination: {
				lat: updatedDestCoords?.lat ?? 0,
				lng: updatedDestCoords?.lng ?? 0,
				label: data.destination ?? "",
			},
			destinationGeog: data.destination_geog ?? null,
			leaveBy: data.departure_time,
			status: data.ride_status === "pending" ? "open" : data.ride_status,
		};
	},

	async joinParty(
		rideId: string,
		userId: string,
		options: { dropoff?: LocationPoint; status?: string } = {},
	) {
		if (env.MOCK_PARTIES) {
			const party = mockPartiesStore.get(rideId);
			if (!party) {
				throw new Error("Party not found");
			}

			let riders = mockPartyRiders.get(rideId);
			if (!riders) {
				riders = new Set<string>();
				mockPartyRiders.set(rideId, riders);
			}

			const alreadyJoined = riders.has(userId);
			riders.add(userId);

			if (!alreadyJoined) {
				const updatedParty: Party = {
					...party,
					currentMembers: party.currentMembers + 1,
					status:
						party.currentMembers + 1 >= party.maxMembers
							? "full"
							: party.status,
				};
				mockPartiesStore.set(rideId, updatedParty);
			}

			return {
				rideId,
				userId,
				dropoff: options.dropoff ?? null,
				status: options.status ?? "pending",
			};
		}

		const payload: Record<string, unknown> = {
			ride_id: rideId,
			user_id: userId,
			join_status: options.status ?? "pending",
		};

		if (options.dropoff) {
			payload.user_destination = JSON.stringify(options.dropoff);
		}

		const { data, error } = await supabaseAdmin
			.from("user_rides")
			.insert(payload)
			.select()
			.single();

		if (error || !data) {
			throw new Error(
				`Failed to join ride: ${error?.message ?? "Unknown error"}`,
			);
		}

		try {
			const { data: rideData } = await supabaseAdmin
				.from("rides")
				.select("current_riders, max_riders")
				.eq("ride_id", rideId)
				.single();

			if (rideData) {
				const nextCurrentRiders = (rideData.current_riders ?? 0) + 1;
				await supabaseAdmin
					.from("rides")
					.update({
						current_riders: nextCurrentRiders,
						ride_status:
							nextCurrentRiders >= (rideData.max_riders ?? 0)
								? "full"
								: "pending",
					})
					.eq("ride_id", rideId);
			}
		} catch {}

		return {
			rideId: data.ride_id,
			userId: data.user_id,
			dropoff: data.user_destination
				? JSON.parse(data.user_destination)
				: null,
			status: data.join_status || data.status,
		};
	},

		async leaveParty(partyId: string, userId: string) {
		if (env.MOCK_PARTIES) {
			const party = mockPartiesStore.get(partyId);
			if (!party) {
				throw new Error("Party not found");
			}

			if (party.leaderUserId === userId) {
				throw new Error("Leader cannot leave party");
			}

			let riders = mockPartyRiders.get(partyId);
			if (!riders) {
				riders = new Set<string>();
				mockPartyRiders.set(partyId, riders);
			}

			const hadUser = riders.has(userId);
			riders.delete(userId);

			if (hadUser) {
				const nextCurrentMembers = Math.max(
					1,
					party.currentMembers - 1,
				);

				const updatedParty: Party = {
					...party,
					currentMembers: nextCurrentMembers,
					status: "open",
				};

				mockPartiesStore.set(partyId, updatedParty);
			}

			return {
				partyId,
				userId,
				left: true,
			};
		}

		const { data: ride, error: rideError } = await supabaseAdmin
			.from("rides")
			.select("ride_id, creator_user_id, current_riders")
			.eq("ride_id", partyId)
			.single();

		if (rideError || !ride) {
			throw new Error("Party not found");
		}

		if (ride.creator_user_id === userId) {
			throw new Error("Leader cannot leave party");
		}

		const { error: deleteError } = await supabaseAdmin
			.from("user_rides")
			.delete()
			.eq("ride_id", partyId)
			.eq("user_id", userId);

		if (deleteError) {
			throw new Error(`Failed to leave party: ${deleteError.message}`);
		}

		const nextCurrentRiders = Math.max(1, (ride.current_riders ?? 1) - 1);

		const { error: updateError } = await supabaseAdmin
			.from("rides")
			.update({
				current_riders: nextCurrentRiders,
				ride_status: "pending",
			})
			.eq("ride_id", partyId);

		if (updateError) {
			throw new Error(`Failed to update ride: ${updateError.message}`);
		}

		return {
			partyId,
			userId,
			left: true,
		};
	},

	async cancelParty(partyId: string, userId: string) {
		if (env.MOCK_PARTIES) {
			const party = mockPartiesStore.get(partyId);
			if (!party) {
				throw new Error("Party not found");
			}

			if (party.leaderUserId !== userId) {
				throw new Error("Only leader can cancel party");
			}

			const updatedParty: Party = {
				...party,
				status: "closed",
			};

			mockPartiesStore.set(partyId, updatedParty);

			return {
				partyId,
				cancelled: true,
			};
		}

		const { data: ride, error: rideError } = await supabaseAdmin
			.from("rides")
			.select("ride_id, creator_user_id")
			.eq("ride_id", partyId)
			.single();

		if (rideError || !ride) {
			throw new Error("Party not found");
		}

		if (ride.creator_user_id !== userId) {
			throw new Error("Only leader can cancel party");
		}

		const { error: updateError } = await supabaseAdmin
			.from("rides")
			.update({
				ride_status: "closed",
			})
			.eq("ride_id", partyId);

		if (updateError) {
			throw new Error(`Failed to cancel party: ${updateError.message}`);
		}

		return {
			partyId,
			cancelled: true,
		};
	},
};
