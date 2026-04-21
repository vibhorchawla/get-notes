import Constants from 'expo-constants';
import { Platform } from 'react-native';

const EXPLICIT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function getExpoHost(): string | null {
    const debuggerHost =
        (Constants as any).expoGoConfig?.debuggerHost ||
        (Constants as any).manifest2?.extra?.expoClient?.debuggerHost ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        return debuggerHost.split(':')[0];
    }

    const hostUri =
        (Constants as any).expoConfig?.hostUri ||
        (Constants as any).manifest2?.extra?.expoClient?.hostUri;

    if (hostUri) {
        return hostUri.split(':')[0];
    }

    return null;
}

function getApiBaseUrl(): string {
    if (EXPLICIT_API_BASE_URL) {
        console.log('[config] Using EXPO_PUBLIC_API_BASE_URL:', EXPLICIT_API_BASE_URL);
        return EXPLICIT_API_BASE_URL;
    }

    const expoHost = getExpoHost();
    if (expoHost) {
        const host = expoHost;
        console.log('[config] Resolved API host:', host);
        return `http://${host}:5000/api`;
    }

    if (Platform.OS === 'android') {
        console.log('[config] Falling back to Android emulator host: 10.0.2.2');
        return 'http://10.0.2.2:5000/api';
    }

    console.log('[config] Using fallback API host: 127.0.0.1');
    return 'http://127.0.0.1:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();
