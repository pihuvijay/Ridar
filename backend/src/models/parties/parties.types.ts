export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationPoint = LatLng & {
  label: string;
};

// ride_status values mirror the design doc (pending/confirmed/etc)
export type PartyStatus = "open" | "full" | "closed" | "completed";

export type UserRide = {
  rideId: string;
  userId: string;
  dropoff: LocationPoint | null;
  status: string; // e.g. 'pending', 'joined', 'cancelled'
};

export type Party = {
  id: string;
  leaderUserId: string;
  name: string;
  maxMembers: number;
  currentMembers: number;
  pickup: LocationPoint;
  destination: LocationPoint;
  leaveBy: string | null;
  status: PartyStatus;
};
