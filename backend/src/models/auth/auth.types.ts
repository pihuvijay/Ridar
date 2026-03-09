export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthSession {
    user: AuthUser;
    accessToken: string;
}
