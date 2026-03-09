import { z } from "zod";

export const CreatePartySchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1), // keep as string for now; validate format later
});