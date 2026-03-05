// HTTP client setup and API calls to communicate with the backend server
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

export interface EmailCodeSendResponse {
  success: boolean;
  message: string;
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

  /**
   * Send email verification code to the provided address
   */
  async sendVerificationCode(email: string): Promise<EmailCodeSendResponse> {
    const response = await fetch(`${API_URL}/api/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  /**
   * Verify the code sent to the provided email
   */
  async verifyEmailCode(
    email: string,
    code: string,
  ): Promise<EmailVerificationResponse> {
    const response = await fetch(`${API_URL}/api/auth/verify-email-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
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

export const uberService = {
  /**
   * Initiate Uber OAuth flow
   */
  async initiateUberAuth(): Promise<any> {
    const response = await fetch(`${API_URL}/api/uber/auth-url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  /**
   * Connect Uber account with authorization code
   */
  async connectUber(
    authCode: string,
    userId: string
  ): Promise<UberConnectionResponse> {
    const response = await fetch(`${API_URL}/api/uber/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify({ authCode }),
    });
    return handleResponse(response);
  },

  /**
   * Check if Uber is connected for a user
   */
  async isConnected(userId: string): Promise<{ connected: boolean }> {
    const response = await fetch(`${API_URL}/api/uber/connected`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
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