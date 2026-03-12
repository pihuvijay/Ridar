// frontend/src/services/api/index.ts
import * as SecureStore from "expo-secure-store";
import { getToken } from "../../utils/authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type ApiError = {
	success: false;
	message: string;
	status?: number;
	raw?: any;
};
export type ApiSuccess<T> = { success: true; status: number; data: T };

function isApiError(x: any): x is ApiError {
	return x && typeof x === "object" && x.success === false;
}

async function getSavedToken() {
	return await SecureStore.getItemAsync("auth_token");
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

		const pretty =
			body && typeof body === "object"
				? JSON.stringify(body, null, 2)
				: body;

		console.log("[api] status =", res.status, "body =", pretty);
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

		// backend returns: { ok: true, data: ... } OR sometimes raw object
		const data = body?.data ?? body;
		return { success: true, status: res.status, data };
	} catch (e) {
		console.log("[api] NETWORK ERROR:", e);
		return { success: false, message: "Network request failed" };
	}
}

/**
 * AUTH
 * Backend currently validates ONLY:
 *  - register: { email, password }
 *  - login:    { email, password }
 *
 * So: we ACCEPT extra signup fields for UI,
 * but only SEND email+password to /auth/register.
 */

export const partiesService = {
	async list() {
		const r = await requestJson<any[]>(`/parties`);

		if ("success" in r && r.success === false) {
			return r;
		}

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

		if ("success" in r && r.success === false) {
			return r;
		}

		return {
			success: true as const,
			data: r.data,
		};
	},
};

export const authService = {
	async signIn(payload: { email: string; password: string }) {
		console.log("[authService.signIn] email =", payload.email);

		const r = await requestJson<any>(`/auth/login`, {
			method: "POST",
			body: JSON.stringify({
				email: payload.email,
				password: payload.password,
			}),
		});

		if (isApiError(r)) return r;

		// ✅ merged backend returns data.accessToken
		const token = r.data?.accessToken;

		return {
			success: true as const,
			token,
			data: r.data,
		};
	},

	async signUp(payload: {
		email: string;
		password: string;
		fullName: string;
		courseMajor: string;
		age: number;
		gender: string;
	}) {
		console.log("[authService.signUp] email =", payload.email);

		const r = await requestJson<any>(`/auth/register`, {
			method: "POST",
			body: JSON.stringify({
				email: payload.email,
				password: payload.password,
				fullName: payload.fullName,
				courseMajor: payload.courseMajor,
				age: payload.age,
				gender: payload.gender,
			}),
		});

		if (isApiError(r)) return r;

		// ✅ merged backend returns data.accessToken
		const token = r.data?.accessToken;

		return {
			success: true as const,
			token,
			data: r.data,
		};
	},
	async sendEmailCode(email: string) {
		const r = await requestJson<{ sent: boolean }>(`/email/send-code`, {
			method: "POST",
			body: JSON.stringify({ email }),
		});
		return r;
	},

	async verifyEmailCode(email: string, code: string) {
		const r = await requestJson<{ verified: boolean }>(
			`/email/verify-code`,
			{
				method: "POST",
				body: JSON.stringify({ email, code }),
			},
		);
		return r;
	},
};

/**
 * USERS
 */
export const userService = {
	async me() {
		const r = await requestJson(`/users/me`);
		if ("success" in r) return r;
		return { success: true, data: r };
	},
};

/**
 * PLACEHOLDERS so your imported screens compile.
 * We’ll wire these to real endpoints after TS builds.
 */
export const uberService = {} as any;
export const paymentService = {} as any;
