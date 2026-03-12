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
  EmailCodeSendResponse,
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

export function useSignIn() {
  const { loading, error, run } = useAsync<AuthResponse>();
  const { setAuth } = useAuth();

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      const result = await run(() => authService.signIn(credentials));

      if (result?.success && result.token && result.data) {
        setAuth(result.data, result.token);
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

export function useSignUp() {
  const { loading, error, run } = useAsync<any>();
  const { setAuth } = useAuth();

  const signUp = useCallback(
    async (data: any) => {
      const result = await run(() => authService.signUp(data));

      // CHANGED: We now only check if it was successful. We don't demand a token.
      if (result?.success) {
        if (result.token) {
          setAuth(result.data, result.token);
        }
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
 * Hook for sending and verifying email verification codes.
 */
export function useEmailVerificationCode() {
  const {
    loading: sendingCode,
    error: sendCodeError,
    run: runSendCode,
  } = useAsync<any>();
  
  const {
    loading: verifyingCode,
    error: verifyCodeError,
    run: runVerifyCode,
  } = useAsync<any>();

  const sendEmailCode = useCallback(
    async (email: string) => {
      const result = await runSendCode(() => authService.sendEmailCode(email));
      return result?.success ?? false;
    },
    [runSendCode],
  );

  const verifyEmailCode = useCallback(
    async (email: string, code: string) => {
      const result = await runVerifyCode(() => authService.verifyEmailCode(email, code));
      return result?.success ?? false;
    },
    [runVerifyCode],
  );

  return {
    sendEmailCode,
    sendVerificationCode: sendEmailCode, // Alias to support both namings
    verifyEmailCode,
    sendingCode,
    sendCodeError,
    verifyingCode,
    verifyCodeError,
  };
}

export function useSignOut() {
  const { clearAuth } = useAuth();
  const signOut = useCallback(() => {
    clearAuth();
  }, [clearAuth]);
  return { signOut };
}

// ==================== PAYMENT HOOKS ====================

export function useAddPaymentMethod() {
  const { loading, error, run } = useAsync<any>();
  const { token } = useAuth();

  const addPaymentMethod = useCallback(
    async (stripeToken: string, cardholderName: string) => {
      if (!token) {
        Alert.alert('Error', 'You must be signed in');
        return false;
      }
      const result = await run(() => paymentService.addPaymentMethod(stripeToken, cardholderName, token));
      return result?.success ?? false;
    },
    [run, token],
  );

  return { addPaymentMethod, loading, error };
}

export function useUberConnection() {
  const { loading, error, run } = useAsync<any>();
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const connectUber = useCallback(
    async (authCode: string) => {
      if (!token) return false;
      const result = await run(() => uberService.connectUber(authCode, token));
      if (result?.success) {
        setIsConnected(true);
        return true;
      }
      return false;
    },
    [run, token],
  );

  const getAuthUrl = useCallback(async () => {
    return run(() => uberService.initiateUberAuth());
  }, [run]);

  return { connectUber, getAuthUrl, isConnected, loading, error };
}

// ==================== RIDE HOOKS ====================

export function useRideGroups() {
  const { loading, error, data, run } = useAsync<any>();
  const { token } = useAuth();

  const fetchRideGroups = useCallback(async () => {
    if (!token) return null;
    return run(() => rideService.getRideGroups(token));
  }, [run, token]);

  return { fetchRideGroups, loading, error, rideGroups: data };
}