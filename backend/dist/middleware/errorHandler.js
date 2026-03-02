"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_1 = require("../utils/http");
const logger_1 = require("../utils/logger");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof http_1.AppError) {
        return res.status(err.statusCode).json({
            ok: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
            },
        });
    }
    logger_1.logger.error(err, "Unhandled error");
    return res.status(500).json({
        ok: false,
        error: { message: "Internal server error" },
    });
};
exports.errorHandler = errorHandler;
