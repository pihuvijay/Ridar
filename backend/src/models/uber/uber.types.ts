export interface UberCoordinates {
    lat: number;
    lng: number;
}

export interface UberPriceEstimate {
    product_id: string;
    display_name: string;
    currency_code: string;
    low_estimate: number;
    high_estimate: number;
    surge_multiplier: number;
    duration: number;   // seconds
    distance: number;   // miles
}

export interface UberRideRequest {
    productId: string;
    start: UberCoordinates;
    end: UberCoordinates;
}

export type UberRideStatus =
    | 'processing'
    | 'accepted'
    | 'arriving'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export interface UberDriver {
    name: string;
    rating: number;
    picture_url: string;
    phone_number: string;
}

export interface UberVehicle {
    make: string;
    model: string;
    license_plate: string;
}

export interface UberRideResponse {
    rideId: string;
    status: UberRideStatus;
    product_id: string;
    driver: UberDriver | null;
    vehicle: UberVehicle | null;
    eta: number;          // minutes until pickup
    fare_estimate: string; // e.g. "$12–$16"
    pickup: UberCoordinates;
    dropoff: UberCoordinates;
    request_time: string;  // ISO timestamp
}
