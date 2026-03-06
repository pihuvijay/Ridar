import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { signUpSchema, signInSchema } from "./auth.schemas";
import { protect } from "../../middleware/auth";

export const authRouter = Router();

// POST /auth/signup
authRouter.post("/signup", validate(signUpSchema), authController.signUp);

// POST /auth/signin
authRouter.post("/signin", validate(signInSchema), authController.signIn);

// POST /auth/signout  (requires a valid token to revoke it)
authRouter.post("/signout", authController.signOut);

// GET /auth/me  (protected — good for testing your JWT works)
authRouter.get("/me", protect, authController.me);
