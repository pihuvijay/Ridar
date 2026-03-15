import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
	status: number;
	code?: string;
	details?: unknown;

	constructor(
		message: string,
		status = 500,
		code?: string,
		details?: unknown,
	) {
		super(message);
		this.name = "AppError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message ?? "Internal Server Error";

  res.status(status).json({
    ok: false,
    error: {
      message,
      code: err?.code ?? "INTERNAL_ERROR",
      details: err?.details,
    },
  });
}