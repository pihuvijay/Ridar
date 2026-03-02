import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { ok } from "../../utils/http";

export const authController = {
    signUp: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, fullName, courseMajor, age, gender } = req.body;
            const session = await authService.signUp({
                email, password, fullName, courseMajor, age, gender,
            });
            res.status(201).json(ok(session));
        } catch (err) {
            next(err);
        }
    },

    signIn: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const session = await authService.signIn(email, password);
            res.json(ok(session));
        } catch (err) {
            next(err);
        }
    },

    signOut: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) return res.status(400).json({ ok: false, error: "No token" });
            await authService.signOut(token);
            res.json({ ok: true });
        } catch (err) {
            next(err);
        }
    },

    // Returns the currently signed-in user (good for testing the token works)
    me: async (req: Request, res: Response) => {
        res.json(ok((req as any).user));
    },
};
