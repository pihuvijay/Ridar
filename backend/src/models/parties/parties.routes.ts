import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import * as c from "./parties.controller";
import {
  createPartySchema,
} from "./parties.schemas";

export const partiesRouter = Router();

partiesRouter.get("/", requireAuth, c.list);
partiesRouter.post("/", requireAuth, validateBody(createPartySchema.shape.body), c.create);
partiesRouter.get("/:partyId", requireAuth, c.getParty);
partiesRouter.patch("/:partyId/locations", requireAuth, c.updateLocations);
partiesRouter.post("/:partyId/join", requireAuth, c.join);