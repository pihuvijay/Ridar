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
import { authDevRouter } from "./models/auth/auth.dev.routes";

import { emailRouter } from "./routes/email.routes";
import { stripeRouter } from "./routes/stripe.routes";
import { uberRouter } from "./routes/uber.routes";
import { uberRidesRouter } from "./models/uber/uber.routes";

export function createApp() {
	const app = express();

	app.use(helmet());
	app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
	app.use(express.json({ limit: "1mb" }));

	app.use((req, res, next) => {
		const requestId = randomUUID();
		(req as any).requestId = requestId;
		res.setHeader("X-Request-Id", requestId);
		next();
	});

	morgan.token("id", (req) => (req as any).requestId ?? "-");
	app.use(
		morgan(
			env.NODE_ENV === "production"
				? ":id :remote-addr :method :url :status :response-time ms"
				: ":id :method :url :status :response-time ms",
		),
	);

	app.get("/", (_req, res) =>
		res.json({
			name: "Ridar API",
			status: "up",
			health: "/health",
			auth: "/auth",
			users: "/users",
			parties: "/parties",
			wallet: "/wallet",
			chat: "/chat",
			reports: "/reports",
			email: "/email",
			stripe: "/stripe",
			uber: "/uber",
		}),
	);

	app.get("/health", (_req, res) =>
		res.status(200).json({ success: true, time: new Date().toISOString() }),
	);

	app.use("/auth", authRouter);
	app.use("/users", usersRouter);
	app.use("/parties", partiesRouter);
	app.use("/wallet", walletRouter);
	app.use("/chat", chatRouter);
	app.use("/reports", reportsRouter);
	app.use("/auth-dev", authDevRouter);

	app.use("/email", emailRouter);
	app.use("/stripe", stripeRouter);
	app.use("/uber", uberRouter);
	app.use("/uber", uberRidesRouter);

	app.use((_req, res) => {
		res.status(404).json({
			success: false,
			message: "Not Found",
		});
	});

	app.use(errorHandler);

	return app;
}