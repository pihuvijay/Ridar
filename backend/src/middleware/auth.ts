import { supabaseAuth } from "../lib/supabase";
import { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
	user?: {
		id: string;
		email?: string;
	};
}

export function protect(
	req: AuthedRequest,
	_res: Response,
	next: NextFunction,
) {
	// used during dev
	req.user = { id: "dev-user" };
	next();
}

function extractBearer(req: Request) {
  const h = req.header("authorization");
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function requireAuth(
	req: AuthedRequest,
	res: Response,
	next: NextFunction
) {
	// Allow tests to bypass auth
	if (process.env.NODE_ENV === "test") {
		req.user = { id: "test-user", email: "test@example.com" };
		return next();
	}

	const token = extractBearer(req);

	if (!token) {
		return res.status(401).json({
			error: {
				message: "Missing or invalid Authorization header",
				code: "AUTH_MISSING",
			},
		});
	}

	const { data, error } = await supabaseAuth.auth.getUser(token);

	if (error || !data?.user) {
		return res.status(401).json({
			error: { message: "Invalid or expired token", code: "AUTH_INVALID" },
		});
	}

	req.user = { id: data.user.id, email: data.user.email ?? undefined };
	return next();
}