export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationPoint = LatLng & {
  label: string;
};

export type PartyStatus = "open" | "full" | "closed" | "completed";

export type UserRide = {
  rideId: string;
  userId: string;
  dropoff: LocationPoint | null;
  status: string;
};

export type Party = {
  id: string;
  leaderUserId: string;
  name: string;
  maxMembers: number;
  currentMembers: number;
  pickup: LocationPoint;
  pickupGeog?: string | null;
  destination: LocationPoint;
  destinationGeog?: string | null;
  leaveBy: string | null;
  status: PartyStatus;
};