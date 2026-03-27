import { Router } from "express";
import { stripeService } from "../services/stripe.service";
import { supabaseAdmin } from "../lib/supabase";

export const stripeRouter = Router();

/**
 * POST /stripe/create-accounts (TEST ONLY)
 * Creates Stripe Customer + Connect account for a user
 */
stripeRouter.post("/create-accounts", async (req, res, next) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "userId and email are required" });
    }

    const result = await stripeService.createStripeAccountsForUser(userId, email, name);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/setup-intent
 * Creates a SetupIntent for the frontend to save a card
 */
stripeRouter.post("/setup-intent", async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get user's stripe_customer_id from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (error || !user?.stripe_customer_id) {
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    const result = await stripeService.createSetupIntent(user.stripe_customer_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/connect-link
 * Generates a Connect Express onboarding link for the user to add bank details
 */
stripeRouter.post("/connect-link", async (req, res, next) => {
  try {
    const { userId, returnUrl, refreshUrl } = req.body;

    if (!userId || !returnUrl || !refreshUrl) {
      return res.status(400).json({ error: "userId, returnUrl, and refreshUrl are required" });
    }

    // Get user's stripe_connect_id from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("stripe_connect_id")
      .eq("user_id", userId)
      .single();

    if (error || !user?.stripe_connect_id) {
      return res.status(404).json({ error: "User or Stripe Connect account not found" });
    }

    const result = await stripeService.createConnectOnboardingLink(
      user.stripe_connect_id,
      returnUrl,
      refreshUrl
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/charge-members
 * Charges each party member's saved card when a ride is confirmed
 */
stripeRouter.post("/charge-members", async (req, res, next) => {
  try {
    const { members } = req.body;
    // members: [{ stripeCustomerId: string, amount: number (in cents) }]

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "members array is required" });
    }

    const results = await stripeService.chargeMembers(members);

    const allSuccessful = results.every(r => r.success);
    res.json({
      success: allSuccessful,
      results
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/payout-leader
 * Transfers collected amount to the Party Leader's Connect account
 */
stripeRouter.post("/payout-leader", async (req, res, next) => {
  try {
    const { userId, amount, platformFeePercent } = req.body;
    // amount in cents

    if (!userId || !amount) {
      return res.status(400).json({ error: "userId and amount are required" });
    }

    // Get user's stripe_connect_id from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("stripe_connect_id")
      .eq("user_id", userId)
      .single();

    if (error || !user?.stripe_connect_id) {
      return res.status(404).json({ error: "User or Stripe Connect account not found" });
    }

    const result = await stripeService.payoutLeader(
      user.stripe_connect_id,
      amount,
      platformFeePercent || 10
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/refund
 * Refunds a payment if a ride is cancelled
 */
stripeRouter.post("/refund", async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "paymentIntentId is required" });
    }

    const result = await stripeService.refundPayment(paymentIntentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /stripe/charge-party
 * Charges all party members and tracks payments in party_payments table
 * Called when Party Leader presses "Ride Ready to Book"
 */
stripeRouter.post("/charge-party", async (req, res, next) => {
  try {
    const { rideId, members } = req.body;
    // members: [{ userId: string, stripeCustomerId: string, amount: number }]

    if (!rideId || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "rideId and members array are required" });
    }

    const results = await stripeService.chargePartyMembers(rideId, members);

    const allSuccessful = results.every(r => r.success);
    res.json({
      success: allSuccessful,
      results
    });
  } catch (err) {
    next(err);
  }
});

stripeRouter.get("/ride/:rideId/payment-status", async (req, res, next) => {
  try {
    const { rideId } = req.params;

    if (!rideId) {
      return res.status(400).json({ error: "rideId is required" });
    }

    const status = await stripeService.getPartyPaymentStatus(rideId);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

stripeRouter.post("/charge-party-safe", async (req, res) => {
  try {
    const { rideId, userId, amount } = req.body;

    if (!rideId || !userId || !amount) {
      return res.json({ success: true, demo: true });
    }


    try {
      // get user stripe id
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .single();

      if (!user?.stripe_customer_id) {
        throw new Error("No stripe customer");
      }

      const results = await stripeService.chargeMembers([
        {
          stripeCustomerId: user.stripe_customer_id,
          amount,
        },
      ]);

      return res.json({
        success: true,
        real: true,
        data: results,
      });
    } catch (err) {
      console.log("[stripe fallback triggered]", err.message);


      return res.json({
        success: true,
        demo: true,
        data: {
          paymentIntentId: `pi_demo_${Date.now()}`,
        },
      });
    }
  } catch (err) {
    console.log("[stripe critical fallback]", err);


    return res.json({
      success: true,
      demo: true,
      data: {
        paymentIntentId: `pi_demo_${Date.now()}`,
      },
    });
  }
});