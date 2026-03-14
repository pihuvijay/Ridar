import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message ?? "Internal Server Error";

  res.status(status).json({
	success: false,
	message,
});
}