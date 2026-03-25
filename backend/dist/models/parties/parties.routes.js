
Object.defineProperty(exports, "__esModule", { value: true });
exports.partiesRouter = void 0;
const express_1 = require("express");
const parties_controller_1 = require("./parties.controller");
const validate_1 = require("../../middleware/validate");
const parties_schemas_1 = require("./parties.schemas");
// import { protect } from "../../middleware/auth"; // when you want auth
exports.partiesRouter = (0, express_1.Router)();
// For now you can skip `protect` or add it later
exports.partiesRouter.post("/", (0, validate_1.validate)(parties_schemas_1.createPartySchema), parties_controller_1.partiesController.createParty);
exports.partiesRouter.get("/:partyId", parties_controller_1.partiesController.getParty);
exports.partiesRouter.patch("/:partyId/locations", (0, validate_1.validate)(parties_schemas_1.updatePartyLocationsSchema), parties_controller_1.partiesController.updatePartyLocations);
// Example stub for join party
exports.partiesRouter.post("/:partyId/join", (0, validate_1.validate)(parties_schemas_1.joinPartySchema), parties_controller_1.partiesController.joinParty);
