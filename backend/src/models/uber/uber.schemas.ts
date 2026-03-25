import { z } from "zod";

export const getPriceEstimatesSchema = z.object({
    query: z.object({
        start_lat: z.coerce.number(),
        start_lng: z.coerce.number(),
        end_lat: z.coerce.number(),
        end_lng: z.coerce.number(),
    }),
});

export const requestRideSchema = z.object({
    body: z.object({
        productId: z.string().min(1),
        startLat: z.number(),
        startLng: z.number(),
        endLat: z.number(),
        endLng: z.number(),
    }),
});

export const rideIdParamSchema = z.object({
    params: z.object({
        rideId: z.string().min(1),
    }),
});
