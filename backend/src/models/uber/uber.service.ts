import { UberCoordinates, UberPriceEstimate, UberRideResponse, UberRideStatus } from './uber.types';
import crypto from 'crypto';


// In-memory store for mock rides
const mockRideStore = new Map<string, UberRideResponse>();

/**
 * Mock driver/vehicle data for demo purposes
 */
const MOCK_DRIVER = {
    name: 'Alex M.',
    rating: 4.87,
    picture_url: 'https://d1a3f4spazzrp4.cloudfront.net/uberex-sandbox/images/driver.jpg',
    phone_number: '+1 555-0147',
};

const MOCK_VEHICLE = {
    make: 'Toyota',
    model: 'Camry',
    license_plate: 'ABC-1234',
};

const MOCK_PRODUCTS = [
    { product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d', display_name: 'UberX' },
    { product_id: '821415d8-3bd5-4e27-9604-194e4359a449', display_name: 'Uber Comfort' },
    { product_id: '57c0ff4e-5b4e-4de0-b82a-df15f5bbfc46', display_name: 'UberXL' },
];

export const uberService = {
    /**
   * Get price estimates.
   *
   * NOTE: Uber deprecated Server Tokens in 2023–2025 and now requires OAuth Bearer
   * tokens for ALL endpoints — including price estimates. Since Uber hasn't approved
   * our app's OAuth scopes, we always return realistic mock estimates here.
   */
    async getPriceEstimates(
        start: UberCoordinates,
        end: UberCoordinates
    ): Promise<UberPriceEstimate[]> {
        return buildMockEstimates(start, end);
    },

    /**
     * Request a ride. Always mocked — real Uber ride ordering requires
     * restricted OAuth scopes not available without business approval.
     */
    async requestRide(params: {
        productId: string;
        start: UberCoordinates;
        end: UberCoordinates;
    }): Promise<UberRideResponse> {
        const { productId, start, end } = params;

        const rideId = 'mock-ride-' + crypto.randomUUID();
        const productName =
            MOCK_PRODUCTS.find((p) => p.product_id === productId)?.display_name ?? 'UberX';

        const ride: UberRideResponse = {
            rideId,
            status: 'processing',
            product_id: productId,
            driver: null,
            vehicle: null,
            eta: 4,
            fare_estimate: `$${(Math.random() * 8 + 8).toFixed(0)}–$${(Math.random() * 6 + 16).toFixed(0)}`,
            pickup: start,
            dropoff: end,
            request_time: new Date().toISOString(),
        };

        mockRideStore.set(rideId, ride);
        return ride;
    },

    /**
     * Get the status of a mocked ride.
     * Progresses status automatically based on elapsed time.
     */
    async getRideStatus(rideId: string): Promise<UberRideResponse> {
        const ride = mockRideStore.get(rideId);
        if (!ride) {
            throw new Error(`Ride ${rideId} not found`);
        }

        // Progress status based on time since request
        const ageMs = Date.now() - new Date(ride.request_time).getTime();
        let newStatus: UberRideStatus = ride.status;

        if (ageMs > 20000 && ride.status === 'processing') {
            newStatus = 'accepted';
            ride.driver = MOCK_DRIVER;
            ride.vehicle = MOCK_VEHICLE;
            ride.eta = 3;
        } else if (ageMs > 40000 && ride.status === 'accepted') {
            newStatus = 'arriving';
            ride.eta = 1;
        } else if (ageMs > 60000 && ride.status === 'arriving') {
            newStatus = 'in_progress';
            ride.eta = 0;
        }

        ride.status = newStatus;
        mockRideStore.set(rideId, ride);
        return ride;
    },

    /**
     * Cancel a mocked ride.
     */
    async cancelRide(rideId: string): Promise<{ cancelled: boolean; rideId: string }> {
        const ride = mockRideStore.get(rideId);
        if (!ride) {
            throw new Error(`Ride ${rideId} not found`);
        }
        ride.status = 'cancelled';
        mockRideStore.set(rideId, ride);
        return { cancelled: true, rideId };
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockEstimates(
    start: UberCoordinates,
    end: UberCoordinates
): UberPriceEstimate[] {
    // Rough distance calc for plausible pricing
    const distMiles = Math.sqrt(
        Math.pow((end.lat - start.lat) * 69, 2) +
        Math.pow((end.lng - start.lng) * 55, 2)
    );

    return MOCK_PRODUCTS.map((p, i): UberPriceEstimate => {
        const base = (i + 1) * 2 + distMiles * 1.5;
        return {
            product_id: p.product_id,
            display_name: p.display_name,
            currency_code: 'GBP',
            low_estimate: parseFloat((base).toFixed(2)),
            high_estimate: parseFloat((base * 1.4).toFixed(2)),
            surge_multiplier: 1,
            duration: Math.round(distMiles * 2.5 * 60),
            distance: parseFloat(distMiles.toFixed(2)),
        };
    });
}
