// Run before any test file; ensures parties API uses in-memory store (no Supabase).
process.env.NODE_ENV = "test";
process.env.MOCK_PARTIES = "true";

// Stub required env vars so the Zod env schema doesn't throw on import.
// These are never used in tests (MOCK_PARTIES=true bypasses all real API calls).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-key";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
process.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
process.env.UBER_CLIENT_ID = process.env.UBER_CLIENT_ID || "test-uber-client-id";
process.env.UBER_CLIENT_SECRET = process.env.UBER_CLIENT_SECRET || "test-uber-client-secret";
process.env.UBER_REDIRECT_URI = process.env.UBER_REDIRECT_URI || "https://localhost/uber/callback";
