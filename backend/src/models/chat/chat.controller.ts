import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "../../middleware/auth";
import * as service from "./chat.service";

// To be implemented using supabase real-time in the future

export async function echo(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { message } = req.body as { message: string };
    const data = await service.echo(message);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}