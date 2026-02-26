// Run before any test file; ensures parties API uses in-memory store (no Supabase).
process.env.NODE_ENV = "test";
process.env.MOCK_PARTIES = "true";
