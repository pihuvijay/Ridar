import pino from "pino";

export const logger =
  process.env.NODE_ENV === "production"
    ? pino()
    : pino({
        transport: { target: "pino-pretty", options: { colorize: true } },
      });