import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "../../middleware/auth";
import * as service from "./parties.service";

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = await service.listParties(userId);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = await service.createParty(userId, req.body);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}