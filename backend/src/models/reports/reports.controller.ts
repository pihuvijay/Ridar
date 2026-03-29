import type { Request, Response, NextFunction } from "express";
import * as service from "./reports.service"

export async function status(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.status();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}