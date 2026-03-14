import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";

class AppError extends Error {
	status: number;
	code: string;
	details?: unknown;

	constructor(
		message: string,
		status = 500,
		code = "INTERNAL_ERROR",
		details?: unknown,
	) {
		super(message);
		this.name = "AppError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export const validate =
	(schema: ZodTypeAny) =>
	(req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				return next(
					new AppError(
						"Validation error",
						400,
						"VALIDATION_ERROR",
						err.flatten(),
					),
				);
			}
			next(err);
		}
	};

export const validateBody = validate;