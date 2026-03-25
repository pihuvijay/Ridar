
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = void 0;
const stripe_1 = require("../lib/stripe");
const supabase_1 = require("../lib/supabase");
exports.stripeService = {
    /**
     * Creates Stripe Customer + Connect Express account for a new user
     * Called automatically during user signup
     */
    async createStripeAccountsForUser(userId, email, name) {
        // 1. Create Stripe Customer (for paying as a member)
        const customer = await stripe_1.stripe.customers.create({
            email,
            name: name || undefined,
            metadata: { supabase_user_id: userId },
        });
        // 2. Create Connect Express account (for receiving payouts as a leader)
        const account = await stripe_1.stripe.accounts.create({
            type: "express",
            email,
            metadata: { supabase_user_id: userId },
        });
        // 3. Save both IDs to the users table
        const { error } = await supabase_1.supabaseAdmin
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
    /**
     * Creates a SetupIntent for saving a card
     * Frontend uses this to trigger the card saving flow
     */
    async createSetupIntent(stripeCustomerId) {
        const setupIntent = await stripe_1.stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
        });
        return {
            clientSecret: setupIntent.client_secret,
        };
    },
    /**
     * Generates a Connect Express onboarding link
     * User clicks this to add their bank details
     */
    async createConnectOnboardingLink(stripeConnectId, returnUrl, refreshUrl) {
        const accountLink = await stripe_1.stripe.accountLinks.create({
            account: stripeConnectId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: "account_onboarding",
        });
        return {
            url: accountLink.url,
        };
    },
    /**
     * Charges each party member's saved card
     * Called when a ride is confirmed
     */
    async chargeMembers(members) {
        const results = [];
        for (const member of members) {
            try {
                // Get the customer's default payment method
                const customer = await stripe_1.stripe.customers.retrieve(member.stripeCustomerId);
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
                const paymentIntent = await stripe_1.stripe.paymentIntents.create({
                    amount: member.amount, // in cents
                    currency: "usd",
                    customer: member.stripeCustomerId,
                    payment_method: defaultPaymentMethod,
                    off_session: true,
                    confirm: true,
                });
                results.push({ customerId: member.stripeCustomerId, success: true, paymentIntentId: paymentIntent.id });
            }
            catch (error) {
                results.push({ customerId: member.stripeCustomerId, success: false, error: error.message });
            }
        }
        return results;
    },
    /**
     * Charges party members and tracks payments in party_payments table
     * Called when Party Leader presses "Ride Ready to Book"
     */
    async chargePartyMembers(rideId, members) {
        const results = [];
        for (const member of members) {
            // Create payment record as pending
            const { data: paymentRecord, error: insertError } = await supabase_1.supabaseAdmin
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
                const customer = await stripe_1.stripe.customers.retrieve(member.stripeCustomerId);
                if (customer.deleted) {
                    await supabase_1.supabaseAdmin
                        .from("party_payments")
                        .update({ status: "failed" })
                        .eq("id", paymentRecord.id);
                    results.push({ userId: member.userId, success: false, error: "Customer deleted" });
                    continue;
                }
                const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;
                if (!defaultPaymentMethod) {
                    await supabase_1.supabaseAdmin
                        .from("party_payments")
                        .update({ status: "failed" })
                        .eq("id", paymentRecord.id);
                    results.push({ userId: member.userId, success: false, error: "No payment method" });
                    continue;
                }
                // Create and confirm the payment
                const paymentIntent = await stripe_1.stripe.paymentIntents.create({
                    amount: member.amount,
                    currency: "gbp",
                    customer: member.stripeCustomerId,
                    payment_method: defaultPaymentMethod,
                    off_session: true,
                    confirm: true,
                });
                // Update payment record as succeeded
                await supabase_1.supabaseAdmin
                    .from("party_payments")
                    .update({
                    status: "succeeded",
                    stripe_payment_intent_id: paymentIntent.id,
                })
                    .eq("id", paymentRecord.id);
                results.push({ userId: member.userId, success: true, paymentIntentId: paymentIntent.id });
            }
            catch (error) {
                // Update payment record as failed
                await supabase_1.supabaseAdmin
                    .from("party_payments")
                    .update({ status: "failed" })
                    .eq("id", paymentRecord.id);
                results.push({ userId: member.userId, success: false, error: error.message });
            }
        }
        return results;
    },
    /**
     * Gets payment status for a ride
     * Used to check if all members have paid before booking
     */
    async getPartyPaymentStatus(rideId) {
        const { data: payments, error } = await supabase_1.supabaseAdmin
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
    /**
     * Transfers funds to the Party Leader's Connect account
     * Called after the ride is completed
     */
    async payoutLeader(stripeConnectId, amount, platformFeePercent = 10) {
        const platformFee = Math.round(amount * (platformFeePercent / 100));
        const leaderPayout = amount - platformFee;
        const transfer = await stripe_1.stripe.transfers.create({
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
    /**
     * Refunds a payment
     * Called if a ride is cancelled after payments are collected
     */
    async refundPayment(paymentIntentId) {
        const refund = await stripe_1.stripe.refunds.create({
            payment_intent: paymentIntentId,
        });
        return {
            refundId: refund.id,
            status: refund.status,
        };
    },
};
