import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { me, patchMe } from "./users.controller";
import { validateBody } from "../../middleware/validate";
import { patchMeSchema } from "./users.schemas";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, me);
usersRouter.patch("/me", requireAuth, validateBody(patchMeSchema), patchMe);
import { rateUserSchema } from "./users.schemas";
import { rateUser } from "./users.controller";

// Rate another user (body: { rating: number })
usersRouter.post("/:id/rating", requireAuth, validateBody(rateUserSchema), rateUser);