import { stripe } from "../lib/stripe";
import { supabaseAdmin } from "../lib/supabase";

export const stripeService = {

  async createStripeAccountsForUser(userId: string, email: string, name?: string) {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { supabase_user_id: userId },
    });

    const account = await stripe.accounts.create({
      type: "express",
      email,
      metadata: { supabase_user_id: userId },
    });

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        stripe_customer_id: customer.id,
        stripe_connect_id: account.id,
      })
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to save Stripe IDs: ${error.message}`);
    }

    return {
      stripeCustomerId: customer.id,
      stripeConnectId: account.id,
    };
  },

  async createSetupIntent(stripeCustomerId: string) {
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  },

  async createConnectOnboardingLink(stripeConnectId: string, returnUrl: string, refreshUrl: string) {
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return {
      url: accountLink.url,
    };
  },

  async chargeMembers(members: { stripeCustomerId: string; amount: number }[]) {
    const results = [];

    for (const member of members) {
      try {
        // Get the customer's default payment method
        const customer = await stripe.customers.retrieve(member.stripeCustomerId);

        if (customer.deleted) {
          results.push({ customerId: member.stripeCustomerId, success: false, error: "Customer deleted" });
          continue;
        }

        const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

        if (!defaultPaymentMethod) {
          results.push({ customerId: member.stripeCustomerId, success: false, error: "No payment method" });
          continue;
        }

        // Create and confirm the payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: member.amount, // in cents
          currency: "usd",
          customer: member.stripeCustomerId,
          payment_method: defaultPaymentMethod as string,
          off_session: true,
          confirm: true,
        });

        results.push({ customerId: member.stripeCustomerId, success: true, paymentIntentId: paymentIntent.id });
      } catch (error: any) {
        results.push({ customerId: member.stripeCustomerId, success: false, error: error.message });
      }
    }

    return results;
  },

  async chargePartyMembers(
    rideId: string,
    members: { userId: string; stripeCustomerId: string; amount: number }[]
  ) {
    const results = [];

    for (const member of members) {
      // Create payment record as pending
      const { data: paymentRecord, error: insertError } = await supabaseAdmin
        .from("party_payments")
        .insert({
          ride_id: rideId,
          user_id: member.userId,
          amount: member.amount,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        results.push({ userId: member.userId, success: false, error: "Failed to create payment record" });
        continue;
      }

      try {
        // Get the customer's default payment method
        const customer = await stripe.customers.retrieve(member.stripeCustomerId);

        if (customer.deleted) {
          await supabaseAdmin
            .from("party_payments")
            .update({ status: "failed" })
            .eq("id", paymentRecord.id);
          results.push({ userId: member.userId, success: false, error: "Customer deleted" });
          continue;
        }

        const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

        if (!defaultPaymentMethod) {
          await supabaseAdmin
            .from("party_payments")
            .update({ status: "failed" })
            .eq("id", paymentRecord.id);
          results.push({ userId: member.userId, success: false, error: "No payment method" });
          continue;
        }

        // Create and confirm the payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: member.amount,
          currency: "gbp",
          customer: member.stripeCustomerId,
          payment_method: defaultPaymentMethod as string,
          off_session: true,
          confirm: true,
        });

        // Update payment record as succeeded
        await supabaseAdmin
          .from("party_payments")
          .update({
            status: "succeeded",
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq("id", paymentRecord.id);

        results.push({ userId: member.userId, success: true, paymentIntentId: paymentIntent.id });
      } catch (error: any) {
        // Update payment record as failed
        await supabaseAdmin
          .from("party_payments")
          .update({ status: "failed" })
          .eq("id", paymentRecord.id);
        results.push({ userId: member.userId, success: false, error: error.message });
      }
    }

    return results;
  },


  async getPartyPaymentStatus(rideId: string) {
    const { data: payments, error } = await supabaseAdmin
      .from("party_payments")
      .select("user_id, amount, status")
      .eq("ride_id", rideId);

    if (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }

    const totalMembers = payments.length;
    const succeededPayments = payments.filter(p => p.status === "succeeded");
    const pendingPayments = payments.filter(p => p.status === "pending");
    const failedPayments = payments.filter(p => p.status === "failed");

    return {
      allPaid: succeededPayments.length === totalMembers && totalMembers > 0,
      totalMembers,
      succeededCount: succeededPayments.length,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
      payments,
    };
  },

  async payoutLeader(stripeConnectId: string, amount: number, platformFeePercent: number = 10) {
    const platformFee = Math.round(amount * (platformFeePercent / 100));
    const leaderPayout = amount - platformFee;

    const transfer = await stripe.transfers.create({
      amount: leaderPayout, // in cents
      currency: "usd",
      destination: stripeConnectId,
    });

    return {
      transferId: transfer.id,
      amount: leaderPayout,
      platformFee,
    };
  },

  async refundPayment(paymentIntentId: string) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return {
      refundId: refund.id,
      status: refund.status,
    };
  },
};
