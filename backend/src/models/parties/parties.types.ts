export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationPoint = LatLng & {
  label: string;
};

export type PartyStatus = "open" | "full" | "closed" | "completed";

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
