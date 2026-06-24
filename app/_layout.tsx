import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { PersonalNotesProvider } from '../context/PersonalNotesContext';
import { ProfilePhotoProvider } from '../hooks/useProfilePhoto';
import CommunitySyncRunner from '../components/CommunitySyncRunner';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
            <PersonalNotesProvider>
            <ProfilePhotoProvider>
            <CommunitySyncRunner />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                    <Stack.Screen name="upload-note" options={{ headerShown: false }} />
                    <Stack.Screen name="personal-note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="shared-note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
                </Stack>
            </ProfilePhotoProvider>
            </PersonalNotesProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
