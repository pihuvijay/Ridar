// React contexts for global state management (auth, theme, user data)
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ==================== AUTH CONTEXT ====================

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  const setAuth = useCallback((user: AuthUser, token: string) => {
    setAuthState({ user, token, isAuthenticated: true });
    // TODO: persist token with expo-secure-store
  }, []);

  const clearAuth = useCallback(() => {
    setAuthState({ user: null, token: null, isAuthenticated: false });
    // TODO: remove token from expo-secure-store
  }, []);

  const value: AuthContextValue = {
    ...authState,
    setAuth,
    clearAuth,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};