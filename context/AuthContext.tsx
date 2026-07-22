import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch, setToken, removeToken, getToken } from '../hooks/useApi';

interface User {
    id?: string;
    email: string;
    name: string;
    course: string;
    isPremium?: boolean;
    premiumPlan?: 'monthly' | 'quarterly' | 'yearly' | null;
    premiumStartDate?: string | null;
    premiumEndDate?: string | null;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string, course: string) => Promise<boolean>;
    logout: () => Promise<void>;
    socialAuth: (token: string, user: User) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await getToken();
            if (token) {
                const userData = await SecureStore.getItemAsync(USER_KEY);
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                requiresAuth: false,
            });

            if (res.success && res.data) {
                await setToken(res.data.token);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.data.user));
                setUser(res.data.user);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    const signup = async (
        email: string,
        password: string,
        name: string,
        course: string
    ): Promise<boolean> => {
        try {
            const res = await apiFetch<{ token: string; user: User }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name, course }),
                requiresAuth: false,
            });

            if (res.success && res.data) {
                await setToken(res.data.token);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.data.user));
                setUser(res.data.user);
                return true;
            }
            const msg = res.message || 'Signup failed. Please try again.';
            throw new Error(msg);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await removeToken();
            await SecureStore.deleteItemAsync(USER_KEY);
            setUser(null);
        } catch {
        }
    };

    const socialAuth = async (token: string, user: User) => {
        await setToken(token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        setUser(user);
    };

    const refreshUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const res = await apiFetch<{ user: User }>('/auth/me');
            if (res.success && res.data?.user) {
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.data.user));
                setUser(res.data.user);
            }
        } catch {
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, socialAuth, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
