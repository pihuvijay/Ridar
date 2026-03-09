import { Request, Response, NextFunction } from "express";
import { partiesService } from "./parties.service";
import { ok } from "../../utils/http";

export const partiesController = {
  createParty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // Fallback: until auth middleware is made, allow userId in body (for testing only)
      const leaderUserId = user?.id ?? req.body.userId;

      const { name, maxMembers, pickup, destination, leaveBy } = req.body;

      const party = await partiesService.createParty(leaderUserId, {
        name,
        maxMembers,
        pickup,
        destination,
        leaveBy,
      });

      res.status(201).json(ok(party));
    } catch (err) {
      next(err);
    }
  },

  getParty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params;
      const party = await partiesService.getParty(partyId);

      if (!party) {
        return res.status(404).json({ ok: false, error: { message: "Party not found" } });
      }

      res.json(ok(party));
    } catch (err) {
      next(err);
    }
  },

  updatePartyLocations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { partyId } = req.params;
      const { pickup, destination } = req.body;

      const party = await partiesService.updatePartyLocations(partyId, {
        pickup,
        destination,
      });

      res.json(ok(party));
    } catch (err) {
      next(err);
    }
  },
};