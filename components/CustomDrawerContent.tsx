import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrap}>
                        <ProfileAvatar size={80} editable={false} />
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    <Text style={styles.userCourse}>{user?.course || 'Course'}</Text>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItems}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Logout Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121826',
    },
    scrollView: {
        paddingTop: 0,
    },
    profileSection: {
        padding: spacing.lg,
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatarWrap: {
        marginBottom: spacing.md,
    },
    userName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    userCourse: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
    },
    drawerItems: {
        flex: 1,
        paddingTop: spacing.md,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    logoutText: {
        marginLeft: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.error,
        fontWeight: typography.fontWeight.medium,
    },
});
