import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

// Routes
// import { authRouter } from "./models/auth/auth.routes";
// import { usersRouter } from "./models/users/users.routes";
// import { chatRouter } from "./models/chat/chat.routes";
// import { partiesRouter } from "./models/parties/parties.routes";
// import { reportsRouter } from "./models/reports/reports.routes";
// import { walletRouter } from "./models/wallet/wallet.routes";
import { stripeRouter } from "./routes/stripe.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true, status: "up" }));

// app.use("/auth", authRouter);
// app.use("/users", usersRouter);
// app.use("/chat", chatRouter);
// app.use("/parties", partiesRouter);
// app.use("/reports", reportsRouter);
// app.use("/wallet", walletRouter);
app.use("/stripe", stripeRouter);

app.use(errorHandler);

process.on("unhandledRejection", (reason) => logger.error(reason, "unhandledRejection"));
process.on("uncaughtException", (err) => logger.error(err, "uncaughtException"));