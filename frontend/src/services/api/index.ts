// frontend/src/services/api/index.ts
import * as SecureStore from "expo-secure-store";
import { getToken } from "../../utils/authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://172.26.196.21:3000";

export type ApiError = {
    success: false;
    message: string;
    status?: number;
    raw?: any;
};
export type ApiSuccess<T> = { success: true; status: number; data: T };

// Types to support the hooks
export type AuthCredentials = { email: string; password: string };
export type SignUpData = {
    email: string;
    password: string;
    fullName: string;
    courseMajor: string;
    age: number;
    gender: string;
};
export type AuthResponse = (ApiSuccess<any> & { token?: string }) | ApiError;
export type EmailVerificationResponse = { success: boolean; isValid?: boolean; message?: string };
export type EmailCodeSendResponse = { success: boolean; sent?: boolean; message?: string };

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

export const authService = {
    async signIn(payload: AuthCredentials) {
        const r = await requestJson<any>(`/auth/login`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (isApiError(r)) return r;
        return { 
            success: true as const, 
            status: r.status,
            token: r.data?.session?.access_token, 
            data: r.data?.user ?? r.data 
        };
    },

    async signUp(payload: SignUpData) {
        const r = await requestJson<any>(`/auth/register`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (isApiError(r)) return r;
        return { 
            success: true as const, 
            status: r.status,
            token: r.data?.session?.access_token, 
            data: r.data?.user ?? r.data 
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
        const r = await requestJson<{ verified: boolean }>(`/email/verify-code`, {
            method: "POST",
            body: JSON.stringify({ email, code }),
        });
        return r;
    },
};

export const userService = {
    async me() {
        const r = await requestJson(`/users/me`);
        return r;
    },
};

// Placeholders for other services
export const uberService = {
    initiateUberAuth: async () => ({ authUrl: "" }),
    connectUber: async (code: string, token: string) => ({ success: false }),
    isConnected: async (token: string) => ({ connected: false }),
} as any;

export const paymentService = {
    addPaymentMethod: async (token: string, name: string, authToken: string) => ({ success: false }),
    getPaymentMethods: async (token: string) => ({ success: true, data: [] }),
} as any;

export const rideService = {
    createRideGroup: async (data: any, token: string) => ({ success: false }),
    getRideGroups: async (token: string) => ({ success: true, data: [] }),
    joinRideGroup: async (id: string, token: string) => ({ success: false }),
} as any;