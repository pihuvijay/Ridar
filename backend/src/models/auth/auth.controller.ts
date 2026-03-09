import type { Request, Response, NextFunction } from "express";
import * as service from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName, courseMajor, age, gender } = req.body as {
      email: string;
      password: string;
      fullName: string;
      courseMajor: string;
      age: number;
      gender: string;
    };

    const data = await service.register(email, password, {
      fullName,
      courseMajor,
      age,
      gender,
    });

    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const data = await service.login(email, password);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    const data = await service.verifyEmail(email);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}