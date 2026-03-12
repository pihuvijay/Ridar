import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { randomUUID } from "crypto";

import { env } from "./config";
import { errorHandler } from "./middleware/errorHandler";

import { authRouter } from "./models/auth/auth.routes";
import { usersRouter } from "./models/users/users.routes";
import { partiesRouter } from "./models/parties/parties.routes";
import { walletRouter } from "./models/wallet/wallet.routes";
import { chatRouter } from "./models/chat/chat.routes";
import { reportsRouter } from "./models/reports/reports.routes";
import { emailRouter } from "./routes/emai.routes";
import { authDevRouter } from "./models/auth/auth.dev.routes";

export function createApp() {
	const app = express();

	// Security
	app.use(helmet());

	// CORS
	app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));

	// JSON parsing
	app.use(express.json({ limit: "1mb" }));

	// Request ID middleware (for better logging)
	app.use((req, res, next) => {
		const requestId = randomUUID();
		(req as any).requestId = requestId;
		res.setHeader("X-Request-Id", requestId);
		next();
	});

	// Logging
	morgan.token("id", (req) => (req as any).requestId ?? "-");
	app.use(
		morgan(
			env.NODE_ENV === "production"
				? ":id :remote-addr :method :url :status :response-time ms"
				: ":id :method :url :status :response-time ms",
		),
	);

	// Root
	app.get("/", (_req, res) =>
		res.json({
			name: "Ridar API",
			status: "up",
			health: "/health",
			auth: "/auth",
			parties: "/parties",
			wallet: "/wallet",
		}),
	);

	// Health check
	app.get("/health", (_req, res) =>
		res.status(200).json({ success: true, time: new Date().toISOString() }),
	);

	// Routes
	app.use("/auth", authRouter);
	app.use("/users", usersRouter);
	app.use("/parties", partiesRouter);
	app.use("/wallet", walletRouter);
	app.use("/chat", chatRouter);
	app.use("/reports", reportsRouter);
	app.use("/auth-dev", authDevRouter);
	app.use("/email", emailRouter);

	// 404 handler
	app.use((_req, res) => {
		res.status(404).json({
			success: false,
			message: "Not Found",
		});
	});

	// Error handler
	app.use(errorHandler);

	return app;
}
