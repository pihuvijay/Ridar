# Ridar Backend API Guide

This document outlines all the API endpoints required by the frontend application. The frontend is now fully integrated to call these endpoints.

## Backend Configuration

- **Base URL**: `http://localhost:3000` (configured in `.env` as `EXPO_PUBLIC_API_URL`)
- **Content-Type**: `application/json`

---

## 1. Authentication Endpoints

### 1.1 Sign In
**Endpoint**: `POST /api/auth/signin`

**Request Body**:
```json
{
  "email": "user@university.ac.uk",
  "password": "password123"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "user@university.ac.uk",
    "fullName": "John Doe"
  }
}
```

**Response** (Error - 401/400):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 1.2 Sign Up
**Endpoint**: `POST /api/auth/signup`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@university.ac.uk",
  "password": "securePassword123",
  "courseMajor": "Computer Science",
  "age": 21,
  "gender": "Male"
}
```

**Response** (Success - 201):
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "john@university.ac.uk",
    "fullName": "John Doe"
  }
}
```

**Response** (Error - 400):
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 1.3 Verify Email
**Endpoint**: `POST /api/auth/verify-email`

**Description**: Verifies that the email is:
1. From a valid university domain (ends in `.ac.uk`)
2. Not already registered in the system

**Request Body**:
```json
{
  "email": "user@university.ac.uk"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Email is valid and available",
  "isValid": true
}
```

**Response** (Error - 400):
```json
{
  "success": false,
  "message": "Email already registered",
  "isValid": false
}
```

---

## 2. Payment Endpoints

### 2.1 Add Payment Method
**Endpoint**: `POST /api/payment/add-method`

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "stripe_token_from_frontend",
  "cardholderName": "John Doe"
}
```

**Description**: 
- The `token` is a Stripe payment token created by the CardField component on the frontend
- Send this token to Stripe on the backend to create a customer payment method
- Store the payment method ID for future transactions

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "paymentMethodId": "pm_1234567890"
}
```

**Response** (Error - 400):
```json
{
  "success": false,
  "message": "Failed to process payment method"
}
```

---

### 2.2 Get Payment Methods
**Endpoint**: `GET /api/payment/methods`

**Authentication**: Required (Bearer token)

**Response** (Success - 200):
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "pm_1234567890",
      "cardholderName": "John Doe",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025
    }
  ]
}
```

---

## 3. Uber Integration Endpoints

### 3.1 Get Uber Auth URL
**Endpoint**: `GET /api/uber/auth-url`

**Description**: Returns the Uber OAuth authorization URL for the user to connect their account

**Response** (Success - 200):
```json
{
  "success": true,
  "authUrl": "https://login.uber.com/oauth/v2/authorize?client_id=..."
}
```

---

### 3.2 Connect Uber Account
**Endpoint**: `POST /api/uber/connect`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "authCode": "authorization_code_from_uber"
}
```

**Description**: 
- Receives the authorization code from Uber OAuth flow
- Exchanges it for an access token
- Stores the token securely for the user

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Uber account connected successfully",
  "accessToken": "uber_access_token_here"
}
```

---

### 3.3 Check Uber Connection Status
**Endpoint**: `GET /api/uber/connected`

**Authentication**: Required (Bearer token)

**Response** (Success - 200):
```json
{
  "connected": true
}
```

---

## 4. Ride Endpoints

### 4.1 Create Ride Group
**Endpoint**: `POST /api/rides/group`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "name": "Monday Morning Commute",
  "destination": "City Center",
  "departureTime": "2024-02-26T08:00:00Z",
  "maxPassengers": 4
}
```

**Response** (Success - 201):
```json
{
  "success": true,
  "message": "Ride group created",
  "groupId": "group_123"
}
```

---

### 4.2 Get All Ride Groups
**Endpoint**: `GET /api/rides/groups`

**Authentication**: Required (Bearer token)

**Response** (Success - 200):
```json
{
  "success": true,
  "groups": [
    {
      "id": "group_123",
      "name": "Monday Morning Commute",
      "destination": "City Center",
      "departureTime": "2024-02-26T08:00:00Z",
      "currentPassengers": 2,
      "maxPassengers": 4,
      "createdBy": "user_123"
    }
  ]
}
```

---

### 4.3 Join Ride Group
**Endpoint**: `POST /api/rides/group/:groupId/join`

**Authentication**: Required (Bearer token)

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Joined ride group successfully"
}
```

---

## Error Handling

All endpoints should follow standard HTTP status codes:

- **200**: Successful GET/POST request
- **201**: Successful resource creation
- **400**: Bad request (invalid data)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not found
- **500**: Server error

All error responses should follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

---

## Authentication Flow

1. User signs up or signs in
2. Backend returns JWT token
3. Frontend stores token (should be in secure storage)
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend verifies token on each request

---

## Notes for Backend Team

1. **Email Verification**: The `.ac.uk` domain check can be done on frontend, but backend should also validate
2. **Password Requirements**: Minimum 8 characters (enforced on frontend, should also validate on backend)
3. **Stripe Integration**: Tokens from the frontend are already created by Stripe's CardField component. You just need to exchange them for payment methods on the backend
4. **Uber OAuth**: You'll need to set up Uber's OAuth flow and store access tokens securely
5. **Token Storage**: Frontend uses JWT tokens but doesn't persist them yet - you may want to implement refresh tokens
6. **CORS**: Make sure backend allows requests from the frontend URL

---

## Testing

You can test these endpoints using tools like Postman or curl. Example:

```bash
# Sign In
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@university.ac.uk","password":"password123"}'

# Verify Email
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@university.ac.uk"}'
```
