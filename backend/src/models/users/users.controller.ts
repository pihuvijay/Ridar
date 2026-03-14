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