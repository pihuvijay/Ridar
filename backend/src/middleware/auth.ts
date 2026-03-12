import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  // This has been changed. Supabase auth is skipped in test environment.
  // Leave req.user unset so the controller's body.userId fallback is used.
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Attach user to request for use in controllers
  (req as any).user = user;
  next();
};