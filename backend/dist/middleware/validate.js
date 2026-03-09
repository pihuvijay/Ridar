"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const http_1 = require("../utils/http");
const validate = (schema) => (req, _res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
        });
        if (parsed.body !== undefined)
            req.body = parsed.body;
        if (parsed.query !== undefined)
            req.query = parsed.query;
        if (parsed.params !== undefined)
            req.params = parsed.params;
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return next(new http_1.AppError("Validation error", 400, "VALIDATION_ERROR", err.flatten()));
        }
        next(err);
    }
};
exports.validate = validate;
