import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "../../middleware/auth";
import * as service from "./wallet.service";

export async function balance(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.getBalance(req.user!.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}