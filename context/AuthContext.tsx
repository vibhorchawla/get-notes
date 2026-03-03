import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
    email: string;
    name: string;
    course: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string, course: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user_data';
const AUTH_KEY = 'is_authenticated';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const isAuth = await SecureStore.getItemAsync(AUTH_KEY);
            if (isAuth === 'true') {
                const userData = await SecureStore.getItemAsync(USER_KEY);
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Mock authentication - in production, validate against backend
            if (email && password.length >= 6) {
                const userData: User = {
                    email,
                    name: email.split('@')[0],
                    course: 'B.Tech CSE',
                };

                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
                await SecureStore.setItemAsync(AUTH_KEY, 'true');
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
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
            // Mock signup - in production, create user in backend
            if (email && password.length >= 6 && name && course) {
                const userData: User = {
                    email,
                    name,
                    course,
                };

                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
                await SecureStore.setItemAsync(AUTH_KEY, 'true');
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(USER_KEY);
            await SecureStore.deleteItemAsync(AUTH_KEY);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
