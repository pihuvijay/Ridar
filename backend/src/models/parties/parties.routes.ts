import { Router } from "express";
import { partiesController } from "./parties.controller";
import { validate } from "../../middleware/validate";
import { createPartySchema, updatePartyLocationsSchema, joinPartySchema } from "./parties.schemas";
import { protect } from "../../middleware/auth";

export const partiesRouter = Router();

partiesRouter.post(
  "/",
  protect,
  validate(createPartySchema),
  partiesController.createParty
);

partiesRouter.get(
  "/:partyId",
  protect,
  partiesController.getParty
);

partiesRouter.patch(
  "/:partyId/locations",
  protect,
  validate(updatePartyLocationsSchema),
  partiesController.updatePartyLocations
);

partiesRouter.post(
  "/:partyId/join",
  protect,
  validate(joinPartySchema),
  partiesController.joinParty
);
