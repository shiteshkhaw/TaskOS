'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/** Safely extract a string message from the various error shapes the API can return:
 *  - `{ error: { message, code } }` — from withErrorHandler
 *  - `{ detail: "..." }` — legacy FastAPI-style
 *  - `{ error: "..." }` — plain string
 */
function extractErrorMessage(data: any, fallback: string): string {
    if (!data) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.error === 'string') return data.error;
    if (data.error && typeof data.error.message === 'string') return data.error.message;
    return fallback;
}

interface User {
    email: string;
    username: string | null;
    is_pro: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'taskguru_token';
const USER_KEY = 'taskguru_user';

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                // Clear corrupted data
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Persist auth state
    const persistAuth = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const clearAuth = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: extractErrorMessage(data, 'Login failed') };
            }

            const userData: User = {
                email: data.user.email,
                username: data.user.username,
                is_pro: data.user.is_pro,
            };

            persistAuth(data.access_token, userData);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, [persistAuth]);

    const signup = useCallback(async (email: string, password: string, username?: string) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: extractErrorMessage(data, 'Signup failed') };
            }

            // Auto-login after signup - login with the new credentials
            const loginResult = await login(email, password);
            return loginResult;
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, [login]);

    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    const updateUser = useCallback((updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
    }, [user]);

    const loginWithGoogle = useCallback(async (idToken: string) => {
        try {
            const response = await fetch('/api/auth/google/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: extractErrorMessage(data, 'Google login failed') };
            }

            const userData: User = {
                email: data.data.user.email,
                username: data.data.user.name,
                is_pro: false, // fallback or get from data if available
            };

            persistAuth(data.data.token, userData);
            return { success: true };
        } catch (error) {
            console.error('Google Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, [persistAuth]);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
