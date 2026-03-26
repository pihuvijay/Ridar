import { z } from "zod";

export const getPriceEstimatesSchema = z.object({
    start_lat: z.coerce.number(),
    start_lng: z.coerce.number(),
    end_lat: z.coerce.number(),
    end_lng: z.coerce.number(),
});

export const requestRideSchema = z.object({
    productId: z.string().min(1),
    startLat: z.coerce.number(),
    startLng: z.coerce.number(),
    endLat: z.coerce.number(),
    endLng: z.coerce.number(),
});

export const rideIdParamSchema = z.object({
    rideId: z.string().min(1),
});
