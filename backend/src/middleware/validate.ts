import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http";

export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });

      // assign parsed values back (optional but nice)
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Validation error", 400, "VALIDATION_ERROR", err.flatten()));
      }
      next(err);
    }
  };