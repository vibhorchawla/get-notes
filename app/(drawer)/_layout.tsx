import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { colors } from '../../constants/colors';

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: colors.textPrimary,
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                drawerStyle: {
                    backgroundColor: '#1A1A2E',
                    borderRightWidth: 1,
                    borderRightColor: 'rgba(255, 255, 255, 0.08)',
                },
            }}
        >
            <Drawer.Screen
                name="home"
                options={{
                    drawerLabel: 'Home',
                    title: 'GetNotes',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="profile"
                options={{
                    drawerLabel: 'My Profile',
                    title: 'Profile',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="notes"
                options={{
                    headerShown: false,
                    drawerLabel: 'My Notes',
                    title: 'My Notes',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="saved"
                options={{
                    drawerLabel: 'Saved Notes',
                    title: 'Saved Notes',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bookmark-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="downloads"
                options={{
                    drawerLabel: 'Downloads',
                    title: 'Downloads',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="download-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    drawerLabel: 'Settings',
                    title: 'Settings',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="subscription"
                options={{
                    headerShown: false,
                    drawerLabel: 'Subscription',
                    title: 'Subscription',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="card-outline" size={size} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}
