"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partiesController = void 0;
const parties_service_1 = require("./parties.service");
const http_1 = require("../../utils/http");
exports.partiesController = {
    createParty: async (req, res, next) => {
        try {
            const user = req.user;
            // Fallback: until auth middleware is made, allow userId in body (for testing only)
            const leaderUserId = user?.id ?? req.body.userId;
            const { name, maxMembers, pickup, destination, leaveBy } = req.body;
            const party = await parties_service_1.partiesService.createParty(leaderUserId, {
                name,
                maxMembers,
                pickup,
                destination,
                leaveBy,
            });
            res.status(201).json((0, http_1.ok)(party));
        }
        catch (err) {
            next(err);
        }
    },
    getParty: async (req, res, next) => {
        try {
            const { partyId } = req.params;
            const party = await parties_service_1.partiesService.getParty(partyId);
            if (!party) {
                return res.status(404).json({ ok: false, error: { message: "Party not found" } });
            }
            res.json((0, http_1.ok)(party));
        }
        catch (err) {
            next(err);
        }
    },
    updatePartyLocations: async (req, res, next) => {
        try {
            const { partyId } = req.params;
            const { pickup, destination } = req.body;
            const party = await parties_service_1.partiesService.updatePartyLocations(partyId, {
                pickup,
                destination,
            });
            res.json((0, http_1.ok)(party));
        }
        catch (err) {
            next(err);
        }
    },
    joinParty: async (req, res, next) => {
        try {
            const user = req.user;
            const userId = user?.id ?? req.body.userId; // fallback for testing
            const { partyId } = req.params;
            const { dropoff, status } = req.body;
            const record = await parties_service_1.partiesService.joinParty(partyId, userId, {
                dropoff,
                status,
            });
            res.status(201).json((0, http_1.ok)(record));
        }
        catch (err) {
            next(err);
        }
    },
};
