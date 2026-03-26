import { z } from "zod";

export const patchMeSchema = z
  .object({
    full_name: z.string().trim().min(1).max(120).optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
  })
  .strict();

export const rateUserSchema = z
  .object({
    rating: z.number().min(1).max(5),
  })
  .strict()
  .required(["rating"]);