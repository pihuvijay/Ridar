import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http";
import { logger } from "../utils/logger";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  logger.error(err, "Unhandled error");

  return res.status(500).json({
    ok: false,
    error: { message: "Internal server error" },
  });
};
