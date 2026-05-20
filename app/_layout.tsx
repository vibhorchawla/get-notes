import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                    <Stack.Screen name="upload-note" options={{ headerShown: false }} />
                    <Stack.Screen name="personal-note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
