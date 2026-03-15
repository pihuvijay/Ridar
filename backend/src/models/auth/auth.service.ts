import { supabaseAdmin, supabaseAuth } from "../../lib/supabase";
import { AuthSession } from "./auth.types";

async function ensurePublicUser(params: {
	userId: string;
	email: string;
	fullName?: string;
	courseMajor?: string;
	age?: number;
	gender?: string;
}) {
	const { userId, email, fullName, courseMajor, age, gender } = params;

	const { data: existing, error: selectError } = await supabaseAdmin
		.from("users")
		.select("user_id")
		.eq("user_id", userId)
		.maybeSingle();

	if (selectError) {
		throw new Error(selectError.message);
	}

	if (existing) {
		return;
	}

	const { error: insertError } = await supabaseAdmin.from("users").insert({
		user_id: userId,
		email,
		name: fullName ?? email.split("@")[0],
		course_major: courseMajor ?? null,
		age: age ?? null,
		gender: gender ?? null,
	});

	if (insertError) {
		throw new Error(insertError.message);
	}
}

export const authService = {
	async signUp(params: {
		email: string;
		password: string;
		fullName: string;
		courseMajor: string;
		age: number;
		gender: string;
	}): Promise<AuthSession> {
		const { email, password, fullName, courseMajor, age, gender } = params;

		const { data, error } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { fullName, courseMajor, age, gender },
		});

		if (error || !data.user) {
			throw new Error(error?.message ?? "Failed to create user");
		}

		await ensurePublicUser({
			userId: data.user.id,
			email,
			fullName,
			courseMajor,
			age,
			gender,
		});

		const { data: session, error: signInError } =
			await supabaseAuth.auth.signInWithPassword({
				email,
				password,
			});

		if (signInError || !session.session) {
			throw new Error("Account created but could not sign in automatically");
		}

		return {
			user: { id: data.user.id, email: data.user.email! },
			accessToken: session.session.access_token,
		};
	},

	async signIn(email: string, password: string): Promise<AuthSession> {
		const { data, error } = await supabaseAuth.auth.signInWithPassword({
			email,
			password,
		});

		if (error || !data.session || !data.user) {
			throw new Error(error?.message ?? "Invalid credentials");
		}

		const meta = (data.user.user_metadata ?? {}) as {
			fullName?: string;
			courseMajor?: string;
			age?: number;
			gender?: string;
		};

		await ensurePublicUser({
			userId: data.user.id,
			email: data.user.email!,
			fullName: meta.fullName,
			courseMajor: meta.courseMajor,
			age: meta.age,
			gender: meta.gender,
		});

		return {
			user: { id: data.user.id, email: data.user.email! },
			accessToken: data.session.access_token,
		};
	},

	async signOut(token: string): Promise<void> {
		const {
			data: { user },
			error: userError,
		} = await supabaseAdmin.auth.getUser(token);

		if (userError || !user) throw new Error("Invalid token");

		const { error } = await supabaseAdmin.auth.admin.signOut(user.id);

		if (error) throw new Error(error.message);
	},

	async verifyEmail(email: string) {
		const { data, error } = await supabaseAuth.auth.resend({
			type: "signup",
			email,
		});

		if (error) throw new Error(error.message);

		return data;
	},
};