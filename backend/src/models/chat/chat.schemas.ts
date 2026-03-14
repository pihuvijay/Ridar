import { z } from "zod";
export const ChatEchoSchema = z.object({ message: z.string().min(1) });