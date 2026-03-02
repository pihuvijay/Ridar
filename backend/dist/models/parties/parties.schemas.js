"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinPartySchema = exports.updatePartyLocationsSchema = exports.createPartySchema = void 0;
const zod_1 = require("zod");
const LocationPointSchema = zod_1.z.object({
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    label: zod_1.z.string().min(1),
});
exports.createPartySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        maxMembers: zod_1.z.number().int().min(2),
        pickup: LocationPointSchema,
        destination: LocationPointSchema,
        leaveBy: zod_1.z.string().datetime().optional().nullable(),
        userId: zod_1.z.string().min(1).optional(), // for testing without auth; auth middleware will set req.user.id
    }),
});
exports.updatePartyLocationsSchema = zod_1.z.object({
    params: zod_1.z.object({
        partyId: zod_1.z.string().min(1),
    }),
    body: zod_1.z
        .object({
        pickup: LocationPointSchema.optional(),
        destination: LocationPointSchema.optional(),
    })
        .refine((data) => data.pickup || data.destination, {
        message: "At least one of pickup or destination is required",
    }),
});
exports.joinPartySchema = zod_1.z.object({
    params: zod_1.z.object({
        partyId: zod_1.z.string().min(1),
    }),
    body: zod_1.z
        .object({
        userId: zod_1.z.string().min(1).optional(), // testing fallback, real auth should supply
        dropoff: LocationPointSchema.optional(),
        status: zod_1.z.string().optional(),
    })
});
