import { z } from "zod";

export const patchMeSchema = z
  .object({
    full_name: z.string().trim().min(1).max(120).optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
  })
  .strict();