import { Router } from 'express';
import { env } from '../config/env';
import { supabaseAdmin } from '../lib/supabase';

interface UberTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}


/**
 * OAuth Flow
User clicks "Connect Uber" in your app
Your app calls GET /uber/connect?userId=abc123 (passing the logged-in user's ID)
Backend returns the Uber OAuth URL with the userId encoded in the state parameter
User opens that URL, logs into Uber, and authorizes your app
Uber redirects to GET /uber/callback with a code and the state (containing userId)
Backend exchanges the code for tokens and saves them to that specific user's row in the users table:
 */

export const uberRouter = Router();

/**
 * GET /uber/connect?userId=xxx
 * Returns the Uber OAuth authorization URL for the user to open
 */
uberRouter.get('/connect', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = new URL('https://login.uber.com/oauth/v2/authorize');
  authUrl.searchParams.set('client_id', env.UBER_CLIENT_ID!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', env.UBER_REDIRECT_URI!);
  authUrl.searchParams.set('scope', 'profile history');
  authUrl.searchParams.set('state', state);

  res.json({ authUrl: authUrl.toString() });
});

/**
 * GET /uber/callback
 * Uber redirects here after user authorizes. Exchanges code for tokens.
 */
uberRouter.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`yourapp://uber-connect?status=error&message=${error}`);
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString());

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.UBER_CLIENT_ID!,
        client_secret: env.UBER_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: env.UBER_REDIRECT_URI!,
        code: code as string,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json() as UberTokenResponse;

    // Save tokens to database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        uber_access_token: tokens.access_token,
        uber_refresh_token: tokens.refresh_token,
        uber_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        uber_connected: true,
      })
      .eq('user_id', userId);

    if (dbError) {
      throw new Error(`DB error: ${dbError.message}`);
    }

    // Redirect to app with success (deep link or web page)
    res.redirect(`yourapp://uber-connect?status=success`);
  } catch (err: any) {
    console.error('Uber callback error:', err);
    res.redirect(`yourapp://uber-connect?status=error&message=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /uber/status?userId=xxx
 * Check if user has connected Uber account
 */
uberRouter.get('/status', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('uber_connected')
    .eq('user_id', userId)
    .single();

  if (error) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ connected: data?.uber_connected ?? false });
});
