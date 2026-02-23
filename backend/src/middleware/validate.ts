import { ZodError, type ZodType } from "zod";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http";

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      }) as { body?: unknown; query?: Record<string, string>; params?: Record<string, string> };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) (req as Request & { query: Record<string, string> }).query = parsed.query;
      if (parsed.params !== undefined) (req as Request & { params: Record<string, string> }).params = parsed.params;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Validation error", 400, "VALIDATION_ERROR", err.flatten()));
      }
      next(err);
    }
  };