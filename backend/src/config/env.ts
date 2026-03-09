import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Optional: if you verify JWT yourself
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),

  // Uber OAuth
  UBER_CLIENT_ID: z.string().min(1),
  UBER_CLIENT_SECRET: z.string().min(1),
  UBER_REDIRECT_URI: z.string().url(),

  // Use mocked ride ordering (real ordering requires restricted OAuth scopes)
  // NOTE: Uber deprecated Server Tokens — all endpoints now require OAuth Bearer tokens
  // which require approved scopes. Since we don't have them, everything is mocked.
  MOCK_UBER: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),

  // Optional: use in-memory store for parties (no Supabase table required). For local testing only.
  MOCK_PARTIES: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);