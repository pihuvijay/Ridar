# Stripe Testing Guide

This guide explains how to test all Stripe endpoints and verify results in Stripe Dashboard and Supabase.

---

## Prerequisites

1. **Server running:** `npm run dev` in the `backend` folder
2. **Test user exists** in Supabase `users` table
3. **Stripe Dashboard** open in test/sandbox mode

---

## Test Data Setup

### Create a test user in Supabase (SQL Editor):
```sql
INSERT INTO users (user_id, email, name)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test User');
```

### Create a test ride in Supabase (SQL Editor):
```sql
INSERT INTO rides (ride_id, creator_user_id, pickup_location, destination)
VALUES ('test-ride-001', '123e4567-e89b-12d3-a456-426614174000', 'Campus', 'Downtown');
```

---

## Endpoint Tests

### 1. Create Stripe Accounts

**What it does:** Creates a Stripe Customer (for paying) and Connect Express account (for receiving payouts) for a user. This runs automatically during signup.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/create-accounts \
  -H "Content-Type: application/json" \
  -d '{"userId": "123e4567-e89b-12d3-a456-426614174000", "email": "test@example.com", "name": "Test User"}'
```

**Expected Response:**
```json
{
  "stripeCustomerId": "cus_xxxxxxxxxxxxx",
  "stripeConnectId": "acct_xxxxxxxxxxxxx"
}
```

**Verify in Stripe Dashboard:**
- **Customers** → See "Test User" listed
- **Developers → Events** → See `customer.created` and `account.created`

**Verify in Supabase:**
- `users` table → `stripe_customer_id` and `stripe_connect_id` columns filled

---

### 2. Setup Intent (Save Card)

**What it does:** Creates a SetupIntent so the frontend can show a card form. The user enters their card details, which gets saved to their Stripe Customer for future charges.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/setup-intent \
  -H "Content-Type: application/json" \
  -d '{"userId": "123e4567-e89b-12d3-a456-426614174000"}'
```

**Expected Response:**
```json
{
  "clientSecret": "seti_xxxxx_secret_xxxxx"
}
```

**Verify in Stripe Dashboard:**
- **Developers → Events** → See `setup_intent.created`
- **Customers → Test User** → Scroll down to see SetupIntents section

**Frontend Usage:**
The `clientSecret` is passed to Stripe's SDK to show a card input form.

---

### 3. Connect Onboarding Link

**What it does:** Generates a URL where the user can add their bank account details to receive payouts as a Party Leader.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/connect-link \
  -H "Content-Type: application/json" \
  -d '{"userId": "123e4567-e89b-12d3-a456-426614174000", "returnUrl": "http://localhost:3000/success", "refreshUrl": "http://localhost:3000/refresh"}'
```

**Expected Response:**
```json
{
  "url": "https://connect.stripe.com/express/onboarding/xxxxx"
}
```

**Verify:**
- Open the URL in a browser → See Stripe's bank onboarding page
- **Developers → Events** → See `account_link.created`

**Frontend Usage:**
Open this URL in a WebView or browser for the user to complete onboarding.

---

### 4. Charge Party Members

**What it does:** Charges all party members' saved cards when the Party Leader presses "Ride Ready to Book". Each payment is tracked in the `party_payments` table.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/charge-party \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "test-ride-001",
    "members": [
      {"userId": "123e4567-e89b-12d3-a456-426614174000", "stripeCustomerId": "cus_xxxxxxxxxxxxx", "amount": 500}
    ]
  }'
```

**Note:** Replace `cus_xxxxxxxxxxxxx` with the actual customer ID from step 1.

**Expected Response (if card saved):**
```json
{
  "success": true,
  "results": [
    {"userId": "123e4567-e89b-12d3-a456-426614174000", "success": true, "paymentIntentId": "pi_xxxxx"}
  ]
}
```

**Expected Response (if no card saved):**
```json
{
  "success": false,
  "results": [
    {"userId": "123e4567-e89b-12d3-a456-426614174000", "success": false, "error": "No payment method"}
  ]
}
```

**Verify in Stripe Dashboard:**
- **Payments** → See payment attempt
- **Developers → Events** → See `payment_intent.created`

**Verify in Supabase:**
- `party_payments` table → See payment record with status

---

### 5. Check Payment Status

**What it does:** Returns whether all party members have paid. Used to enable the "Book Ride" button for the Party Leader.

**Command:**
```bash
curl http://localhost:3000/stripe/ride/test-ride-001/payment-status
```

**Expected Response:**
```json
{
  "allPaid": false,
  "totalMembers": 1,
  "succeededCount": 0,
  "pendingCount": 0,
  "failedCount": 1,
  "payments": [
    {"user_id": "123e4567-e89b-12d3-a456-426614174000", "amount": 500, "status": "failed"}
  ]
}
```

**Frontend Usage:**
Poll this endpoint to update the UI showing "2/3 members paid" etc.

---

### 6. Payout Leader

**What it does:** Transfers collected funds (minus platform fee) to the Party Leader's Connect account after all members have paid.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/payout-leader \
  -H "Content-Type: application/json" \
  -d '{"userId": "123e4567-e89b-12d3-a456-426614174000", "amount": 1000, "platformFeePercent": 10}'
```

**Expected Response:**
```json
{
  "transferId": "tr_xxxxx",
  "amount": 900,
  "platformFee": 100
}
```

**Note:** Will fail if Connect account hasn't completed onboarding (no bank details).

**Verify in Stripe Dashboard:**
- **Balance → Payouts** → See transfer
- **Connect → Accounts** → See account balance

---

### 7. Refund Payment

**What it does:** Refunds a payment if a ride is cancelled after payments were collected.

**Command:**
```bash
curl -X POST http://localhost:3000/stripe/refund \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId": "pi_xxxxxxxxxxxxx"}'
```

**Note:** Replace `pi_xxxxxxxxxxxxx` with an actual PaymentIntent ID from a successful charge.

**Expected Response:**
```json
{
  "refundId": "re_xxxxx",
  "status": "succeeded"
}
```

**Verify in Stripe Dashboard:**
- **Payments** → See refund on the payment
- **Developers → Events** → See `refund.created`

---

## Test Cards

Use these test card numbers in Stripe's card form:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date (e.g., 12/34) and any 3-digit CVC.

---

## Where to Find Results

### Stripe Dashboard

| What | Where |
|------|-------|
| Customers | **Customers** (left sidebar) |
| Payments | **Payments** (left sidebar) |
| SetupIntents | **Customers → [Customer] → SetupIntents** |
| Connect accounts | **Connect → Accounts** |
| All events | **Developers → Events** |
| Payouts | **Balance → Payouts** |

### Supabase

| What | Where |
|------|-------|
| Stripe IDs | `users` table → `stripe_customer_id`, `stripe_connect_id` |
| Payment records | `party_payments` table |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "User or Stripe customer not found" | User doesn't have Stripe IDs | Run `/create-accounts` first |
| "No payment method" | User hasn't saved a card | Complete SetupIntent flow first |
| "Connect account not onboarded" | User hasn't added bank | Complete Connect onboarding first |
| "Insufficient funds" | Test card simulates decline | Use `4242 4242 4242 4242` |

---

## Full Test Flow

1. **Create accounts:** `/stripe/create-accounts`
2. **Save card:** `/stripe/setup-intent` → Complete in frontend
3. **Add bank:** `/stripe/connect-link` → Complete onboarding
4. **Charge members:** `/stripe/charge-party`
5. **Check status:** `/stripe/ride/:rideId/payment-status`
6. **Payout leader:** `/stripe/payout-leader`
7. **Refund (if needed):** `/stripe/refund`
