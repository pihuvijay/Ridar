import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { ok } from "../../utils/http";

export const authController = {
  // POST /auth/signup
  signUp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, fullName, courseMajor, age, gender } = req.body;

      const session = await authService.signUp({
        email,
        password,
        fullName,
        courseMajor,
        age,
        gender,
      });

      res.status(201).json(ok(session));
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/signin
  signIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const session = await authService.signIn(email, password);

      res.json(ok(session));
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/signout
  signOut: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(400).json({ ok: false, error: "No token" });
      }

      await authService.signOut(token);

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/verify-email
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const data = await authService.verifyEmail(email);

      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  },

  // GET /auth/me
  me: async (req: Request, res: Response) => {
    res.json(ok((req as any).user));
  },
};