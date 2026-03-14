import dotenv from "dotenv";
import path from "path";
import fs from "fs";
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(".env file not found at:", envPath);
}
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("*"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  MOCK_PARTIES: z.coerce.boolean().optional().default(false),

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
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1), 
});

export const env = EnvSchema.parse(process.env);