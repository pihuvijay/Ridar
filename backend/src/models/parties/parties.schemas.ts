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
    leaveBy: z.string().datetime().optional().nullable(),
    userId: z.string().min(1).optional(), // for testing without auth; auth middleware will set req.user.id
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
});
