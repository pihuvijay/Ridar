// Custom React hooks for reusable stateful logic and side effects
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts";
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
} from "../services/api";

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

	const run = useCallback(
		async (asyncFn: () => Promise<T>): Promise<T | null> => {
			setState({ data: null, loading: true, error: null });
			try {
				const result = await asyncFn();
				setState({ data: result, loading: false, error: null });
				return result;
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "An unexpected error occurred";
				setState({ data: null, loading: false, error: message });
				return null;
			}
		},
		[],
	);

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
				Alert.alert(
					"Sign In Failed",
					result.message || "Invalid credentials",
				);
			}

			return false;
		},
		[run, setAuth],
	);

	return { signIn, loading, error };
}

export function useSignUp() {
	const { loading, error, run } = useAsync<AuthResponse>();
	const { setAuth } = useAuth();

	const signUp = useCallback(
		async (data: SignUpData) => {
			const result = await run(() => authService.signUp(data));

			if (result?.success) {
				if (result.token && result.data) {
					setAuth(result.data, result.token);
				}
				return true;
			}

			if (result && !result.success) {
				Alert.alert(
					"Error",
					result.message || "Failed to create account",
				);
			}

			return false;
		},
		[run, setAuth],
	);

	return { signUp, loading, error };
}

export function useEmailVerificationCode() {
	const {
		loading: sendingCode,
		error: sendCodeError,
		run: runSendCode,
	} = useAsync<EmailCodeSendResponse>();

	const {
		loading: verifyingCode,
		error: verifyCodeError,
		run: runVerifyCode,
	} = useAsync<EmailVerificationResponse>();

	const sendEmailCode = useCallback(
		async (email: string) => {
			const result = await runSendCode(() =>
				authService.sendEmailCode(email),
			);
			return result?.success ?? false;
		},
		[runSendCode],
	);

	const verifyEmailCode = useCallback(
		async (email: string, code: string) => {
			const result = await runVerifyCode(() =>
				authService.verifyEmailCode(email, code),
			);
			return result?.success ?? false;
		},
		[runVerifyCode],
	);

	return {
		sendEmailCode,
		sendVerificationCode: sendEmailCode,
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
				Alert.alert(
					"Error",
					"You must be signed in to add a payment method",
				);
				return false;
			}

			const result = await run(() =>
				paymentService.addPaymentMethod(
					stripeToken,
					cardholderName,
					token,
				),
			);

			if (result?.success) {
				return true;
			}

			if (result && !result.success) {
				Alert.alert(
					"Error",
					result.message || "Failed to add payment method",
				);
			}

			return false;
		},
		[run, token],
	);

	return { addPaymentMethod, loading, error };
}

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

export function useUberConnection() {
	const { loading, error, run } = useAsync<any>();
	const { token } = useAuth();
	const [isConnected, setIsConnected] = useState(false);

	const connectUber = useCallback(
		async (authCode: string) => {
			if (!token) {
				Alert.alert("Error", "You must be signed in to connect Uber");
				return false;
			}

			const result = await run(() =>
				uberService.connectUber(authCode, token),
			);

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
		if (result && "connected" in (result as any)) {
			setIsConnected((result as any).connected);
			return (result as any).connected;
		}
		return false;
	}, [run, token]);

	const getAuthUrl = useCallback(async () => {
		return run(() => uberService.initiateUberAuth());
	}, [run]);

	return {
		connectUber,
		checkConnection,
		getAuthUrl,
		isConnected,
		loading,
		error,
	};
}

// ==================== RIDE HOOKS ====================

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
				Alert.alert(
					"Error",
					"You must be signed in to create a ride group",
				);
				return null;
			}

			return run(() => rideService.createRideGroup(data, token));
		},
		[run, token],
	);

	return { createRideGroup, loading, error };
}

export function useRideGroups() {
	const { loading, error, data, run } = useAsync<any>();
	const { token } = useAuth();

	const fetchRideGroups = useCallback(async () => {
		if (!token) return null;
		return run(() => rideService.getRideGroups(token));
	}, [run, token]);

	return { fetchRideGroups, loading, error, rideGroups: data };
}

export function useJoinRideGroup() {
	const { loading, error, run } = useAsync<any>();
	const { token } = useAuth();

	const joinRideGroup = useCallback(
		async (groupId: string) => {
			if (!token) {
				Alert.alert(
					"Error",
					"You must be signed in to join a ride group",
				);
				return null;
			}

			return run(() => rideService.joinRideGroup(groupId, token));
		},
		[run, token],
	);

	return { joinRideGroup, loading, error };
}