import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './config';

const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
    requiresAuth?: boolean;
}

export async function apiFetch<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (requiresAuth) {
        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('[apiFetch] Request failed:', {
            url,
            method: fetchOptions.method || 'GET',
            requiresAuth,
            error,
        });
        throw error;
    }
}
