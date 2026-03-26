import type { Response } from "express";
import { getOrCreateProfile, updateMyProfile } from "./users.service";

export async function me(req: any, res: Response) {
  const user = req.user as { id: string; email?: string };

  const profile = await getOrCreateProfile(user);

  res.json({
    id: user.id,
    email: user.email,
    profile,
  });
}

export async function patchMe(req: any, res: Response) {
  const user = req.user as { id: string; email?: string };

  const { full_name, avatar_url } = req.body ?? {};
  const profile = await updateMyProfile(user.id, { full_name, avatar_url });

  res.json({
    id: user.id,
    email: user.email,
    profile,
  });
}

export async function rateUser(req: any, res: Response) {
  const targetUserId = req.params.id as string;
  const { rating } = req.body ?? {};
  const rater = req.user as { id: string };

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Invalid rating' });
  }

  try {
    const profile = await require("./users.service").then((m: any) => m.rateUser(targetUserId, rater.id, rating));
    res.json({ success: true, profile });
  } catch (err: any) {
    console.error('[users.rateUser] error', err);
    res.status(500).json({ success: false, message: 'Failed to save rating' });
  }
}