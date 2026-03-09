import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import * as c from "./parties.controller";
import { CreatePartySchema } from "./parties.schemas";

export const partiesRouter = Router();

partiesRouter.get("/", requireAuth, c.list);
partiesRouter.post("/", requireAuth, validateBody(CreatePartySchema), c.create);