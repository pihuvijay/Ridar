import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { authController as c } from "./auth.controller";
import {
  LoginSchema,
  RegisterSchema,
  VerifyEmailSchema,
} from "./auth.schemas";

export const authRouter = Router();

// Keep the routes your frontend already uses
authRouter.post("/register", validateBody(RegisterSchema), c.signUp);
authRouter.post("/login", validateBody(LoginSchema), c.signIn);
authRouter.post("/verify-email", validateBody(VerifyEmailSchema), c.verifyEmail);

// Optional aliases to match the other branch
authRouter.post("/signup", validateBody(RegisterSchema), c.signUp);
authRouter.post("/signin", validateBody(LoginSchema), c.signIn);