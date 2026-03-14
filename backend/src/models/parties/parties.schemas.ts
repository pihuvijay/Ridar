import { z } from "zod";

const LocationPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string().min(1),
});

export const createPartySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    maxMembers: z.number().int().min(2),
    pickup: LocationPointSchema,
    destination: LocationPointSchema,
    leaveBy: z.string().optional().nullable(), // relaxed for MVP
    userId: z.string().min(1).optional(),
  }),
});

export const updatePartyLocationsSchema = z.object({
  params: z.object({
    partyId: z.string().min(1),
  }),
  body: z
    .object({
      pickup: LocationPointSchema.optional(),
      destination: LocationPointSchema.optional(),
    })
    .refine((data) => data.pickup || data.destination, {
      message: "At least one of pickup or destination is required",
    }),
});

export const joinPartySchema = z.object({
  params: z.object({
    partyId: z.string().min(1),
  }),
  body: z
    .object({
      userId: z.string().min(1).optional(), // testing fallback, real auth will supply
      dropoff: LocationPointSchema.optional(),
      status: z.string().optional(),
    })
});
