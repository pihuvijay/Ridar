// API client and service functions for backend communication

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ==================== TYPES ====================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  courseMajor: string;
  age: number;
  gender: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  isValid: boolean;
}

export interface PaymentMethodResponse {
  success: boolean;
  message: string;
  paymentMethodId?: string;
}

export interface UberConnectionResponse {
  success: boolean;
  message: string;
  accessToken?: string;
}

// ==================== HELPERS ====================

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// ==================== AUTH ENDPOINTS ====================

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  /**
   * Create a new account
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Verify email belongs to a university and is not already registered
   */
  async verifyEmail(email: string): Promise<EmailVerificationResponse> {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },
};

// ==================== PAYMENT ENDPOINTS ====================

export const paymentService = {
  /**
   * Create a payment method with Stripe token
   */
  async addPaymentMethod(
    token: string,
    cardholderName: string,
    userId: string
  ): Promise<PaymentMethodResponse> {
    const response = await fetch(`${API_URL}/api/payment/add-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Replace with actual auth token
      },
      body: JSON.stringify({
        token,
        cardholderName,
      }),
    });
    return handleResponse(response);
  },

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/payment/methods`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
    });
    return handleResponse(response);
  },
};

// ==================== UBER INTEGRATION ENDPOINTS ====================

export interface UberPriceEstimate {
  product_id: string;
  display_name: string;
  currency_code: string;
  low_estimate: number;
  high_estimate: number;
  surge_multiplier: number;
  duration: number;
  distance: number;
}

export interface UberRideResponse {
  rideId: string;
  status: 'processing' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  product_id: string;
  driver: { name: string; rating: number; picture_url: string; phone_number: string } | null;
  vehicle: { make: string; model: string; license_plate: string } | null;
  eta: number;
  fare_estimate: string;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  request_time: string;
}

export const uberService = {
  /**
   * Get Uber OAuth URL for the current user
   */
  async getConnectUrl(userId: string): Promise<{ authUrl: string }> {
    const response = await fetch(`${API_URL}/uber/connect?userId=${encodeURIComponent(userId)}`);
    return handleResponse(response);
  },

  /**
   * Check if user has connected their Uber account
   */
  async getConnectionStatus(userId: string): Promise<{ connected: boolean }> {
    const response = await fetch(`${API_URL}/uber/status?userId=${encodeURIComponent(userId)}`);
    return handleResponse(response);
  },

  /**
   * Get price estimates between two coordinates.
   * Hits the real Uber sandbox API — no ride is created.
   */
  async getPriceEstimates(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    token: string
  ): Promise<{ ok: boolean; data: UberPriceEstimate[] }> {
    const params = new URLSearchParams({
      start_lat: String(startLat),
      start_lng: String(startLng),
      end_lat: String(endLat),
      end_lng: String(endLng),
    });
    const response = await fetch(`${API_URL}/uber/estimates?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  /**
   * Request an Uber ride (mocked on the backend for MVP demo).
   */
  async requestRide(
    productId: string,
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    token: string
  ): Promise<{ ok: boolean; data: UberRideResponse }> {
    const response = await fetch(`${API_URL}/uber/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, startLat, startLng, endLat, endLng }),
    });
    return handleResponse(response);
  },

  /**
   * Poll ride status — status auto-progresses over time on the backend.
   */
  async getRideStatus(
    rideId: string,
    token: string
  ): Promise<{ ok: boolean; data: UberRideResponse }> {
    const response = await fetch(`${API_URL}/uber/ride/${encodeURIComponent(rideId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  /**
   * Cancel a ride.
   */
  async cancelRide(
    rideId: string,
    token: string
  ): Promise<{ ok: boolean; data: { cancelled: boolean; rideId: string } }> {
    const response = await fetch(`${API_URL}/uber/ride/${encodeURIComponent(rideId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },
};

// ==================== RIDE ENDPOINTS ====================

export const rideService = {
  /**
   * Create a new ride group
   */
  async createRideGroup(
    data: {
      name: string;
      destination: string;
      departureTime: string;
      maxPassengers: number;
    },
    userId: string
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/rides/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Get all ride groups
   */
  async getRideGroups(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/rides/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Join a ride group
   */
  async joinRideGroup(groupId: string, userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/rides/group/${groupId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
    });
    return handleResponse(response);
  },
};
