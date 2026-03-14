import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { z } from "zod";

const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath });
} else {
	console.warn(".env file not found at:", envPath);
}

const EnvSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),

	PORT: z.coerce.number().int().positive().default(3000),

	CORS_ORIGIN: z.string().default("*"),

	SUPABASE_URL: z.string().url(),
	SUPABASE_ANON_KEY: z.string().min(1),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

	// Uber OAuth
	UBER_CLIENT_ID: z.string().optional(),
	UBER_CLIENT_SECRET: z.string().optional(),
	UBER_REDIRECT_URI: z.string().optional(),

	// Mock settings
	MOCK_UBER: z
		.string()
		.optional()
		.transform((v) => v === "true" || v === "1"),

	MOCK_PARTIES: z
		.string()
		.optional()
		.transform((v) => v === "true" || v === "1"),

	// Email SMTP
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().default(2525),
	SMTP_USER: z.string().min(1),
	SMTP_PASS: z.string().min(1),
	SMTP_FROM: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);