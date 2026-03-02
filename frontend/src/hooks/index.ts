// Custom React hooks for reusable stateful logic and side effects
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts';
import {
  authService,
  paymentService,
  uberService,
  rideService,
  AuthCredentials,
  SignUpData,
  AuthResponse,
  EmailVerificationResponse,
  PaymentMethodResponse,
  UberConnectionResponse,
} from '../services/api';

// ==================== GENERIC ASYNC HOOK ====================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, run, reset };
}

// ==================== AUTH HOOKS ====================

/**
 * Hook for signing in a user.
 * Automatically stores auth state in context on success.
 */
export function useSignIn() {
  const { loading, error, run } = useAsync<AuthResponse>();
  const { setAuth } = useAuth();

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      const result = await run(() => authService.signIn(credentials));

      if (result?.success && result.token && result.user) {
        setAuth(result.user, result.token);
        return true;
      }

      if (result && !result.success) {
        Alert.alert('Sign In Failed', result.message || 'Invalid credentials');
      }

      return false;
    },
    [run, setAuth],
  );

  return { signIn, loading, error };
}

/**
 * Hook for creating a new account.
 */
export function useSignUp() {
  const { loading, error, run } = useAsync<AuthResponse>();
  const { setAuth } = useAuth();

  const signUp = useCallback(
    async (data: SignUpData) => {
      const result = await run(() => authService.signUp(data));

      if (result?.success && result.token && result.user) {
        setAuth(result.user, result.token);
        return true;
      }

      if (result && !result.success) {
        Alert.alert('Error', result.message || 'Failed to create account');
      }

      return false;
    },
    [run, setAuth],
  );

  return { signUp, loading, error };
}

/**
 * Hook for verifying a university email.
 */
export function useVerifyEmail() {
  const { loading, error, data, run } = useAsync<EmailVerificationResponse>();

  const verifyEmail = useCallback(
    async (email: string) => {
      const result = await run(() => authService.verifyEmail(email));
      return result?.isValid ?? false;
    },
    [run],
  );

  return { verifyEmail, loading, error, isValid: data?.isValid ?? false };
}

/**
 * Hook for signing out.
 */
export function useSignOut() {
  const { clearAuth } = useAuth();

  const signOut = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return { signOut };
}

// ==================== PAYMENT HOOKS ====================

/**
 * Hook for adding a payment method via Stripe.
 */
export function useAddPaymentMethod() {
  const { loading, error, run } = useAsync<PaymentMethodResponse>();
  const { token } = useAuth();

  const addPaymentMethod = useCallback(
    async (stripeToken: string, cardholderName: string) => {
      if (!token) {
        Alert.alert('Error', 'You must be signed in to add a payment method');
        return false;
      }

      const result = await run(() =>
        paymentService.addPaymentMethod(stripeToken, cardholderName, token),
      );

      if (result?.success) {
        return true;
      }

      if (result && !result.success) {
        Alert.alert('Error', result.message || 'Failed to add payment method');
      }

      return false;
    },
    [run, token],
  );

  return { addPaymentMethod, loading, error };
}

/**
 * Hook for fetching payment methods.
 */
export function usePaymentMethods() {
  const { loading, error, data, run } = useAsync<any>();
  const { token } = useAuth();

  const fetchPaymentMethods = useCallback(async () => {
    if (!token) return null;
    return run(() => paymentService.getPaymentMethods(token));
  }, [run, token]);

  return { fetchPaymentMethods, loading, error, paymentMethods: data };
}

// ==================== UBER HOOKS ====================

/**
 * Hook for connecting an Uber account.
 */
export function useUberConnection() {
  const { loading, error, run } = useAsync<any>();
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const connectUber = useCallback(
    async (authCode: string) => {
      if (!token) {
        Alert.alert('Error', 'You must be signed in to connect Uber');
        return false;
      }

      const result = await run(() => uberService.connectUber(authCode, token));

      if (result?.success) {
        setIsConnected(true);
        return true;
      }

      return false;
    },
    [run, token],
  );

  const checkConnection = useCallback(async () => {
    if (!token) return false;
    const result = await run(() => uberService.isConnected(token));
    if (result && 'connected' in result) {
      setIsConnected((result as any).connected);
      return (result as any).connected;
    }
    return false;
  }, [run, token]);

  const getAuthUrl = useCallback(async () => {
    return run(() => uberService.initiateUberAuth());
  }, [run]);

  return { connectUber, checkConnection, getAuthUrl, isConnected, loading, error };
}

// ==================== RIDE HOOKS ====================

/**
 * Hook for creating a ride group.
 */
export function useCreateRideGroup() {
  const { loading, error, run } = useAsync<any>();
  const { token } = useAuth();

  const createRideGroup = useCallback(
    async (data: {
      name: string;
      destination: string;
      departureTime: string;
      maxPassengers: number;
    }) => {
      if (!token) {
        Alert.alert('Error', 'You must be signed in to create a ride group');
        return null;
      }

      return run(() => rideService.createRideGroup(data, token));
    },
    [run, token],
  );

  return { createRideGroup, loading, error };
}

/**
 * Hook for fetching ride groups.
 */
export function useRideGroups() {
  const { loading, error, data, run } = useAsync<any>();
  const { token } = useAuth();

  const fetchRideGroups = useCallback(async () => {
    if (!token) return null;
    return run(() => rideService.getRideGroups(token));
  }, [run, token]);

  return { fetchRideGroups, loading, error, rideGroups: data };
}

/**
 * Hook for joining a ride group.
 */
export function useJoinRideGroup() {
  const { loading, error, run } = useAsync<any>();
  const { token } = useAuth();

  const joinRideGroup = useCallback(
    async (groupId: string) => {
      if (!token) {
        Alert.alert('Error', 'You must be signed in to join a ride group');
        return null;
      }

      return run(() => rideService.joinRideGroup(groupId, token));
    },
    [run, token],
  );

  return { joinRideGroup, loading, error };
}