import { supabaseAdmin } from "../../lib/supabase";
import { AuthSession } from "./auth.types";

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

        // 1. Create user in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // skip email verification for MVP
            user_metadata: { fullName, courseMajor, age, gender },
        });

        if (error || !data.user) {
            throw new Error(error?.message ?? "Failed to create user");
        }

        // 2. Upsert a matching row in the public users table
        await supabaseAdmin.from("users").upsert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            course: courseMajor,
            age,
            gender,
        });

        // 3. Sign in immediately to get a session token
        const { data: session, error: signInError } =
            await supabaseAdmin.auth.signInWithPassword({ email, password });

        if (signInError || !session.session) {
            throw new Error("Account created but could not sign in automatically");
        }

        return {
            user: { id: data.user.id, email: data.user.email! },
            accessToken: session.session.access_token,
        };
    },

    async signIn(email: string, password: string): Promise<AuthSession> {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.session) {
            throw new Error(error?.message ?? "Invalid credentials");
        }

        return {
            user: { id: data.user.id, email: data.user.email! },
            accessToken: data.session.access_token,
        };
    },

    async signOut(token: string): Promise<void> {
        // Get the user from the token first, then revoke their sessions
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !user) {throw new Error("Invalid token");}
        const { error } = await supabaseAdmin.auth.admin.signOut(user.id);
        if (error) {throw new Error(error.message);}
    },
};
