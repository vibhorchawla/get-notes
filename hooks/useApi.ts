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

export async function refreshToken(): Promise<string | null> {
    const token = await getToken();
    if (!token) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const json = await response.json();
            if (json.success && json.data?.token) {
                await setToken(json.data.token);
                return json.data.token;
            }
        }
    } catch {}
    return null;
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
        if (!token) {
            return { success: false, message: 'Not signed in' };
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        if (response.status === 401 && requiresAuth) {
            const refreshed = await refreshToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${refreshed}`;
                const retryResponse = await fetch(url, { ...fetchOptions, headers });
                let retryJson: { success: boolean; data?: T; message?: string };
                try {
                    retryJson = await retryResponse.json();
                } catch {
                    return { success: false, message: 'Request failed after refresh' };
                }
                if (!retryResponse.ok && retryJson.success !== true) {
                    return { success: false, message: retryJson.message || 'Request failed' };
                }
                return retryJson;
            }
            await removeToken();
            return {
                success: false,
                message: 'Session expired. Please sign in again.',
            };
        }

        let json: { success: boolean; data?: T; message?: string };
        try {
            json = await response.json();
        } catch {
            return {
                success: false,
                message: response.ok ? 'Invalid server response' : `Request failed (${response.status})`,
            };
        }

        if (!response.ok && json.success !== true) {
            return {
                success: false,
                message: json.message || `Request failed (${response.status})`,
            };
        }

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
