import { getToken } from "../../utils/authStorage";

// Default API host. Use `EXPO_PUBLIC_API_URL` from .env for overrides.
// For development on a LAN device, use the machine IP (e.g. 192.168.1.111:3000).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.111:3000";

export type ApiError = {
	success: false;
	message: string;
	status?: number;
	raw?: any;
};

export type ApiSuccess<T> = {
	success: true;
	status: number;
	data: T;
};

export type AuthCredentials = {
	email: string;
	password: string;
};

export type SignUpData = {
	email: string;
	password: string;
	fullName: string;
	courseMajor: string;
	age: number;
	gender: string;
};

export type AuthResponse = (ApiSuccess<any> & { token?: string }) | ApiError;

export type EmailCodeSendResponse = {
	success: boolean;
	sent?: boolean;
	message?: string;
	status?: number;
};

export type EmailVerificationResponse = {
	success: boolean;
	verified?: boolean;
	isValid?: boolean;
	message?: string;
	status?: number;
};

function isApiError(x: any): x is ApiError {
	return x && typeof x === "object" && x.success === false;
}

async function requestJson<T = any>(
	path: string,
	options: RequestInit = {},
): Promise<ApiSuccess<T> | ApiError> {
	const url = `${API_URL}${path}`;
	console.log("[api] API_URL =", API_URL);
	console.log("[api]", options.method ?? "GET", "->", url);

	try {
		const token = await getToken();

		const res = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...(options.headers ?? {}),
			},
		});

		const text = await res.text();
		let body: any = null;

		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = text;
		}

		console.log("[api] status =", res.status, "body =", body);

		if (!res.ok) {
			const msg =
				(body && (body.message || body.error?.message || body.error)) ||
				`Request failed (${res.status})`;

			return {
				success: false,
				message: String(msg),
				status: res.status,
				raw: body,
			};
		}

		const data = body?.data ?? body;
		return { success: true, status: res.status, data };
	} catch (e) {
		console.log("[api] NETWORK ERROR:", e);
		return { success: false, message: "Network request failed" };
	}
}

export const partiesService = {
	async list() {
		const r = await requestJson<any[]>(`/parties`);

		if (isApiError(r)) return r;

		return {
			success: true as const,
			data: r.data ?? [],
		};
	},

	async create(payload: {
		name: string;
		maxMembers: number;
		pickup: {
			lat: number;
			lng: number;
			label: string;
		};
		destination: {
			lat: number;
			lng: number;
			label: string;
		};
		leaveBy?: string | null;
	}) {
		const r = await requestJson<any>(`/parties`, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (isApiError(r)) return r;

		return {
			success: true as const,
			data: r.data,
		};
	},

	async join(
		partyId: string,
		payload?: {
			dropoff?: {
				lat: number;
				lng: number;
				label: string;
			};
			status?: string;
		},
	) {
		const r = await requestJson<any>(`/parties/${partyId}/join`, {
			method: "POST",
			body: JSON.stringify(payload ?? {}),
		});

		if (isApiError(r)) return r;

		return {
			success: true as const,
			data: r.data,
		};
	},
};

export const authService = {
	async signIn(payload: AuthCredentials): Promise<AuthResponse> {
		const r = await requestJson<any>(`/auth/login`, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (isApiError(r)) return r;

		const token = r.data?.accessToken ?? r.data?.session?.access_token;

		return {
			success: true as const,
			status: r.status,
			token,
			data: r.data,
		};
	},

	async signUp(payload: SignUpData): Promise<AuthResponse> {
		const r = await requestJson<any>(`/auth/register`, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (isApiError(r)) return r;

		const token = r.data?.accessToken ?? r.data?.session?.access_token;

		return {
			success: true as const,
			status: r.status,
			token,
			data: r.data,
		};
	},

	async sendEmailCode(email: string) {
		return await requestJson<{ sent: boolean }>(`/email/send-code`, {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	},

	async verifyEmailCode(email: string, code: string) {
		return await requestJson<{ verified: boolean }>(`/email/verify-code`, {
			method: "POST",
			body: JSON.stringify({ email, code }),
		});
	},
};

export const userService = {
	async me() {
		return await requestJson(`/users/me`);
	},
	async rateUser(userId: string, rating: number) {
		return await requestJson(`/users/${userId}/rating`, {
			method: 'POST',
			body: JSON.stringify({ rating }),
		});
	},
};

export const uberService = {
	async initiateUberAuth() {
		return await requestJson<{ authUrl: string }>(`/uber/auth-url`);
	},

	async connectUber(authCode: string, _token?: string) {
		return await requestJson<any>(`/uber/connect`, {
			method: "POST",
			body: JSON.stringify({ authCode }),
		});
	},
	async requestRide(params: {
		productId: string;
		startLat: number;
		startLng: number;
		endLat: number;
		endLng: number;
	}) {
		return await requestJson<any>(`/uber/request`, {
			method: "POST",
			body: JSON.stringify(params),
		});
	},

	async getRideStatus(rideId: string) {
		return await requestJson<any>(`/uber/ride/${rideId}`);
	},

	async cancelRide(rideId: string) {
		return await requestJson<any>(`/uber/ride/${rideId}`, {
			method: "DELETE",
		});
	},

	async getPriceEstimates(
		startLat: number,
		startLng: number,
		endLat: number,
		endLng: number,
	) {
		return await requestJson<any>(
			`/uber/estimates?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`,
		);
	},
};

export const paymentService = {
	addPaymentMethod: async (
		_token: string,
		_name: string,
		_authToken: string,
	) => ({ success: false }),
	getPaymentMethods: async (_token: string) => ({ success: true, data: [] }),
} as any;

export const rideService = {
	createRideGroup: async (_data: any, _token: string) => ({ success: false }),
	getRideGroups: async (_token: string) => ({ success: true, data: [] }),
	joinRideGroup: async (_id: string, _token: string) => ({ success: false }),
} as any;