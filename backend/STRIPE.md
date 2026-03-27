# Stripe Integration for Rydar

## Overview

Every Rydar user gets two Stripe identities created automatically during onboarding:

| ID | Purpose |
|----|---------|
| **Stripe Customer ID** | For paying as a party member |
| **Stripe Connect Express ID** | For receiving payouts as a Party Leader |

---

## The Complete Rydar Flow

### 1. Onboarding
- User signs up
- Backend auto-creates Stripe Customer + Connect Express account
- User connects their Uber account
- User adds payment method (card) via Stripe
- User adds bank details via Stripe Connect onboarding

### 2. Party Formation
- Party Leader creates a group
- Members join the party
- Price estimate calculated using Uber API based on:
  - Number of riders
  - Pickup/destination
  - Wait time / leave-by time
- If leave-by time is reached with fewer riders than max, show popup:
  - "Extend wait by 5 mins" OR "Leave now"

### 3. Initiating the Booking
- Once party is full (or leader chooses to leave), Party Leader presses **"Ride Ready to Book"**

### 4. Pricing
- Fare retrieved from Uber API
- Platform commission applied
- Each member's share calculated

### 5. Payment Collection
- Stripe payment requests sent to **all party members EXCEPT the Party Leader**
- Each member confirms payment
- Money collected into Party Leader's Stripe Connect account

### 6. Booking the Ride
- Once ALL payments received → Party Leader presses **"Book Ride"**
- Party Leader pays Uber using collected funds
- Ride confirmed
- Pickup location + driver ETA displayed to all members

### 7. Meetup
- All members head to shared pickup point

### 8. Insights (Post-Ride)
- Each user sees:
  - Carbon emissions saved vs individual rides
  - Money saved by splitting fare

---

## Payment Flow Summary

```
Members pay → Money goes to Party Leader's Connect account → Party Leader pays Uber
```

| Step | Who | Action |
|------|-----|--------|
| 1 | Members | Pay their share via Stripe |
| 2 | Stripe | Deposits funds to Party Leader's Connect account |
| 3 | Party Leader | Books & pays for Uber ride |

---

## Setup

### Prerequisites
1. **Stripe Account** — [Sign up here](https://dashboard.stripe.com/register)
2. **Enable Connect Express** — Stripe Dashboard → Settings → Connect → Enable Express
3. **API Keys** — Stripe Dashboard → Developers → API Keys

### Environment Variables
Add to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### Installation
```bash
cd backend
npm install stripe
```

### Database
`users` table columns:
| Column | Type | Description |
|--------|------|-------------|
| `stripe_customer_id` | text | For charging user's saved card |
| `stripe_connect_id` | text | For receiving payouts |

---

## API Endpoints

### `POST /stripe/create-accounts`
Creates Stripe Customer + Connect Express account for a user during signup.

### `POST /stripe/setup-intent`
Creates a SetupIntent so user can save their card.
**Use case:** User adds payment method during onboarding.

### `POST /stripe/connect-link`
Generates Connect Express onboarding link.
**Use case:** User adds bank account to receive payouts.

### `POST /stripe/charge-members`
Charges each party member's saved card when ride is ready to book.
**Use case:** Collect payments from all members before booking.

### `POST /stripe/payout-leader`
Transfers collected funds to Party Leader's Connect account.
**Use case:** After all members pay, funds go to leader so they can book Uber.

### `POST /stripe/refund`
Refunds payments if ride is cancelled.

---

## Frontend Integration

### 1. Add Card (Onboarding)
```typescript
const response = await fetch('/stripe/setup-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id })
});
const { clientSecret } = await response.json();

// Use Stripe SDK to show card form
await stripe.confirmCardSetup(clientSecret);
```

### 2. Add Bank Account (Onboarding)
```typescript
const response = await fetch('/stripe/connect-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    returnUrl: 'rydar://stripe-return',
    refreshUrl: 'rydar://stripe-refresh'
  })
});
const { url } = await response.json();

// Open Stripe onboarding
Linking.openURL(url);
```

### 3. Charge Members (When Ride Ready)
```typescript
// Backend calls this when Party Leader presses "Ride Ready to Book"
const response = await fetch('/stripe/charge-members', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    members: [
      { stripeCustomerId: 'cus_xxx', amount: 500 }, // £5.00 in pence
      { stripeCustomerId: 'cus_yyy', amount: 500 },
    ]
  })
});
```

---

## Edge Cases

| Scenario | How to Handle |
|----------|---------------|
| **Member payment fails** | Retry once, then notify user. Remove from party if unresolved. |
| **Fare adjustment** | If Uber charges more than estimate, charge difference to members. |
| **Ride cancelled** | Refund all collected payments via `/stripe/refund`. |

---

## Testing

Use test cards:
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 9995` | Insufficient funds |

---

## Production

To go live:
1. Complete Stripe account verification
2. Replace `sk_test_` with `sk_live_` keys
3. Replace `pk_test_` with `pk_live_` keys

---

## How the Code Works

```
Frontend → routes/stripe.routes.ts → services/stripe.service.ts → lib/stripe.ts → Stripe API
```

| Layer | Role |
|-------|------|
| **routes** | Receives HTTP request, validates input, calls service |
| **service** | Business logic, builds Stripe API calls |
| **lib** | Authenticated Stripe client connection |

---

## Resources

- [Stripe Node.js SDK](https://github.com/stripe/stripe-node)
- [Stripe Connect Express](https://stripe.com/docs/connect/express-accounts)
- [Stripe React Native SDK](https://github.com/stripe/stripe-react-native)