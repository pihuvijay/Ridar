
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    // Optional: if you verify JWT yourself
    SUPABASE_JWT_SECRET: zod_1.z.string().min(1).optional(),
    // Stripe
    STRIPE_SECRET_KEY: zod_1.z.string().min(1),
    STRIPE_PUBLISHABLE_KEY: zod_1.z.string().min(1),
    // Optional: use in-memory store for parties (no Supabase table required). For local testing only.
    MOCK_PARTIES: zod_1.z
        .string()
        .optional()
        .transform((v) => v === "true" || v === "1"),
});
exports.env = EnvSchema.parse(process.env);
