import { Router } from "express";
import { partiesController } from "./parties.controller";
import { validate } from "../../middleware/validate";
import { createPartySchema, updatePartyLocationsSchema, joinPartySchema } from "./parties.schemas";
// import { protect } from "../../middleware/auth"; // when you want auth

export const partiesRouter = Router();

// For now you can skip `protect` or add it later
partiesRouter.post(
  "/",
  validate(createPartySchema),
  partiesController.createParty
);

partiesRouter.get(
  "/:partyId",
  partiesController.getParty
);

partiesRouter.patch(
  "/:partyId/locations",
  validate(updatePartyLocationsSchema),
  partiesController.updatePartyLocations
);

// Example stub for join party
partiesRouter.post(
  "/:partyId/join",
  validate(joinPartySchema),
  (req, res) => {
    res.status(501).json({ ok: false, error: { message: "Not implemented yet" } });
  }
);
