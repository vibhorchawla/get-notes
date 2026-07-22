export const oauthConfig = {
    google: {
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    },
    facebook: {
        appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
        clientToken: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || '',
    },
};
