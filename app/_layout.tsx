import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { PersonalNotesProvider } from '../context/PersonalNotesContext';
import { ProfilePhotoProvider } from '../hooks/useProfilePhoto';
import { ToastProvider } from '../context/ToastContext';
import CommunitySyncRunner from '../components/CommunitySyncRunner';
import OfflineBanner from '../components/OfflineBanner';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
            <PersonalNotesProvider>
            <ProfilePhotoProvider>
            <ToastProvider>
            <CommunitySyncRunner />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                    <Stack.Screen name="upload-note" options={{ headerShown: false }} />
                    <Stack.Screen name="community/index" options={{ headerShown: false }} />
                    <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="semester/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="subject/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="pdf-viewer" options={{ headerShown: false, presentation: 'modal' }} />
                    <Stack.Screen name="personal-note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="shared-note/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="coming-soon" options={{ headerShown: true, title: 'Coming Soon' }} />
                    <Stack.Screen name="settings/about" options={{ headerShown: true, title: 'About GetNotes' }} />
                    <Stack.Screen name="settings/contact" options={{ headerShown: true, title: 'Contact Us' }} />
                    <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy Policy' }} />
                    <Stack.Screen name="settings/terms" options={{ headerShown: true, title: 'Terms & Conditions' }} />
                    <Stack.Screen name="settings/faq" options={{ headerShown: true, title: 'FAQ' }} />
                    <Stack.Screen name="settings/feedback" options={{ headerShown: true, title: 'Send Feedback' }} />
                </Stack>
                <OfflineBanner />
            </ToastProvider>
            </ProfilePhotoProvider>
            </PersonalNotesProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
