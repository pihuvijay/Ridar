# Uber Integration

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React Native)                                                    │
│                                                                             │
│  ┌──────────────────┐     calls     ┌────────────────────┐                 │
│  │  Connect Uber    │ ───────────►  │  useUberConnect    │                 │
│  │  Button          │               │  hook              │                 │
│  │                  │ ◄───────────  │                    │                 │
│  │  Shows ✓ green   │   returns     │  - connect()       │                 │
│  │  when connected  │   connected   │  - checkStatus()   │                 │
│  └──────────────────┘   true/false  └─────────┬──────────┘                 │
│                                               │                             │
│                                               │ fetch()                     │
└───────────────────────────────────────────────┼─────────────────────────────┘
                                                │
                                                ▼  HTTP request
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND (Node.js)                                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │  uber.routes.ts                                          │               │
│  │                                                          │               │
│  │  GET /uber/connect?userId=xxx                            │               │
│  │    → Returns { authUrl } to open in browser              │               │
│  │                                                          │               │
│  │  GET /uber/callback                                      │               │
│  │    → Uber redirects here after user logs in              │               │
│  │    → Saves tokens to database                            │               │
│  │                                                          │               │
│  │  GET /uber/status?userId=xxx                             │               │
│  │    → Returns { connected: true/false }                   │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                               │                             │
│                                               │ supabaseAdmin               │
└───────────────────────────────────────────────┼─────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATABASE (Supabase)                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │  users table                                             │               │
│  │                                                          │               │
│  │  - user_id                                               │               │
│  │  - uber_access_token                                     │               │
│  │  - uber_refresh_token                                    │               │
│  │  - uber_token_expires_at                                 │               │
│  │  - uber_connected (true/false)                           │               │
│  └─────────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Instructions

### Step 1: Check if connected
```
GET /uber/status?userId=USER_ID
```
Returns `{ "connected": true }` or `{ "connected": false }`

### Step 2: Connect button pressed
```
GET /uber/connect?userId=USER_ID
```
Returns `{ "authUrl": "https://..." }`

Open that URL in browser. User logs into Uber there.

### Step 3: After user authorizes
User gets redirected back to app via deep link:
- Success: `yourapp://uber-connect?status=success`
- Error: `yourapp://uber-connect?status=error&message=...`

Backend handles everything else (token exchange, saving to database).

## Frontend Implementation

1. **Create a hook file** `useUberConnect.ts` in `frontend/src/hooks/`
   - Has `connect()` function to start OAuth
   - Has `checkStatus()` function to check if connected
   - Returns `connected` (true/false) state

2. **In the button component:**
   - Call `checkStatus()` when screen loads
   - If `connected === true` → show green tick ✓ or change button color
   - If `connected === false` → show "Connect Uber" button
   - When button pressed → call `connect()`

3. **After user returns from Uber:**
   - Re-check status automatically
   - Update UI to show connected state

## Database Requirements

Add these columns to the `users` table in Supabase:
- `uber_access_token` (text)
- `uber_refresh_token` (text)
- `uber_token_expires_at` (timestamp)
- `uber_connected` (boolean)
