import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import * as c from "./auth.controller";
import { LoginSchema, RegisterSchema, VerifyEmailSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validateBody(RegisterSchema), c.register);
authRouter.post("/login", validateBody(LoginSchema), c.login);
authRouter.post("/verify-email", validateBody(VerifyEmailSchema), c.verifyEmail);