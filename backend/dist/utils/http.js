
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.AppError = AppError;
const ok = (data) => ({ ok: true, data });
exports.ok = ok;
