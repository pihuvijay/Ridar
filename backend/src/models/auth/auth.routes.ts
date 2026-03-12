import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { authController } from "./auth.controller";
import {
  LoginSchema,
  RegisterSchema,
  VerifyEmailSchema,
} from "./auth.schemas";

export const authRouter = Router();

// Keep the routes your frontend already uses
authRouter.post("/register", validateBody(RegisterSchema), authController.signUp);
authRouter.post("/login", validateBody(LoginSchema), authController.signIn);
authRouter.post("/verify-email", validateBody(VerifyEmailSchema), authController.verifyEmail);

// Optional aliases to match the other branch
authRouter.post("/signup", validateBody(RegisterSchema), authController.signUp);
authRouter.post("/signin", validateBody(LoginSchema), authController.signIn);