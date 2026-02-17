// Express middleware for authentication, validation, error handling, and CORS
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http";
import { supabaseAdmin } from "../lib/supabase";

export type AuthedRequest = Request & {
  user?: { id: string; email?: string | null };
};

export const requireAuth = async (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return next(new AppError("Missing Authorization token", 401, "UNAUTHORIZED"));

  // Supabase can validate the JWT and return the user
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }

  req.user = { id: data.user.id, email: data.user.email };
  next();
};