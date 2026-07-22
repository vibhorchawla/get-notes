import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
            <Stack.Screen name="login" options={{ animation: 'none' }} />
            <Stack.Screen name="signup" options={{ animation: 'none' }} />
        </Stack>
    );
}
