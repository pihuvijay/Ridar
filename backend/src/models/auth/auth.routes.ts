import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import * as c from "./auth.controller";
import {
  LoginSchema,
  RegisterSchema,
  VerifyEmailSchema,
} from "./auth.schemas";

export const authRouter = Router();

// Keep the routes your frontend already uses
authRouter.post("/register", validateBody(RegisterSchema), c.register);
authRouter.post("/login", validateBody(LoginSchema), c.login);
authRouter.post("/verify-email", validateBody(VerifyEmailSchema), c.verifyEmail);

// Optional aliases to match the other branch
authRouter.post("/signup", validateBody(RegisterSchema), c.register);
authRouter.post("/signin", validateBody(LoginSchema), c.login);