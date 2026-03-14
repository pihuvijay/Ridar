import type { Response, NextFunction, Request } from "express";
import { partiesService } from "./parties.service";

interface AuthedRequest extends Request {
  user?: { id: string };
}

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = await partiesService.listParties(userId);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { name, maxMembers, pickup, destination, leaveBy } = req.body;

    const data = await partiesService.createParty(userId, {
      name,
      maxMembers,
      pickup,
      destination,
      leaveBy,
    });

    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getParty(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const data = await partiesService.getParty(partyId);

    if (!data) {
      return res.status(404).json({ ok: false, error: { message: "Party not found" } });
    }

    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function updateLocations(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { partyId } = req.params;
    const { pickup, destination } = req.body;

    const data = await partiesService.updatePartyLocations(partyId, {
      pickup,
      destination,
    });

    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function join(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { partyId } = req.params;
    const { dropoff, status } = req.body;

    const data = await partiesService.joinParty(partyId, userId, {
      dropoff,
      status,
    });

    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}