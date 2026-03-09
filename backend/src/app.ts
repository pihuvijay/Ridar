import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) =>
  res.json({ name: "Ridar API", status: "up", health: "/health", auth: "/auth", parties: "/parties", stripe: "/stripe", uber: "/uber" })
);
app.get("/health", (_req, res) => res.json({ ok: true, status: "up" }));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.status(200).json({ ok: true, time: new Date().toISOString() }));


  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/parties", partiesRouter);
  app.use("/wallet", walletRouter);
  app.use("/chat", chatRouter);
  app.use("/reports", reportsRouter);
  app.use("/auth-dev", authDevRouter);
  app.use("/email", emailRouter);

  // 404 handler (no route matched)
  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use(errorHandler);
  return app;
}