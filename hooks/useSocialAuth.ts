import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import { oauthConfig } from '../constants/oauth';
import { apiFetch } from './useApi';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    email: string;
    name: string;
    course: string;
}

export function useGoogleAuth() {
    const router = useRouter();
    const { socialAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [, response, promptAsync] = Google.useAuthRequest({
        iosClientId: oauthConfig.google.iosClientId,
        androidClientId: oauthConfig.google.androidClientId,
        webClientId: oauthConfig.google.webClientId,
        redirectUri: makeRedirectUri({ scheme: 'getnotes' }),
    });

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const { idToken } = result.params;
                if (!idToken) return false;

                const res = await apiFetch<{ token: string; user: User }>('/auth/google', {
                    method: 'POST',
                    body: JSON.stringify({ idToken }),
                    requiresAuth: false,
                });

                if (res.success && res.data) {
                    await socialAuth(res.data.token, res.data.user);
                    router.replace('/home');
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('[Google Auth] Error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signInWithGoogle, isLoading, response };
}

export function useFacebookAuth() {
    const router = useRouter();
    const { socialAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [, response, promptAsync] = Facebook.useAuthRequest({
        clientId: oauthConfig.facebook.appId,
        redirectUri: makeRedirectUri({ scheme: 'getnotes' }),
    });

    const signInWithFacebook = async () => {
        setIsLoading(true);
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const { access_token } = result.params;
                if (!access_token) return false;

                const res = await apiFetch<{ token: string; user: User }>('/auth/facebook', {
                    method: 'POST',
                    body: JSON.stringify({ accessToken: access_token }),
                    requiresAuth: false,
                });

                if (res.success && res.data) {
                    await socialAuth(res.data.token, res.data.user);
                    router.replace('/home');
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('[Facebook Auth] Error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signInWithFacebook, isLoading, response };
}
