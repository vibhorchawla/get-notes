import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamically resolves the backend URL from Expo's runtime host.
// This means the IP auto-updates whenever your Wi-Fi changes —
// no more manual edits needed.
function getApiBaseUrl(): string {
    // If we're on an Android Emulator, 10.0.2.2 is the magic IP that 
    // bypasses the LAN firewall and points directly to the PC's localhost!
    if (Platform.OS === 'android') {
        console.log('[config] Android emulator detected, using 10.0.2.2');
        return 'http://10.0.2.2:5000/api';
    }

    // Expo SDK 46+ (Expo Go): debuggerHost = "192.168.x.x:8081"
    const debuggerHost =
        (Constants as any).expoGoConfig?.debuggerHost ||   // SDK 46+
        (Constants as any).manifest2?.extra?.expoClient?.debuggerHost || // SDK 46 fallback
        Constants.manifest?.debuggerHost;                  // SDK < 46

    if (debuggerHost) {
        const host = debuggerHost.split(':')[0];           // strip the Expo port
        console.log('[config] Resolved API host:', host);
        return `http://${host}:5000/api`;
    }

    // Fallback for production / physical builds without Expo Go
    console.log('[config] Using fallback API host: 192.168.1.22');
    return 'http://192.168.1.22:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();
