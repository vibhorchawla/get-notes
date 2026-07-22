import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function Header() {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const topOffset = insets.top + spacing.sm;

    return (
        <View style={[styles.container, { paddingTop: topOffset + spacing.lg }]}>
            <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={[styles.menuButton, { top: topOffset }]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open navigation menu"
            >
                <Ionicons name="menu" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.notificationButton, { top: topOffset }]}
                onPress={() => router.push('/coming-soon')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
            >
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(40).springify().damping(14)} style={styles.brandCard}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="library" size={22} color={colors.textOnPrimary} />
                    </View>
                    <View>
                        <Text style={styles.appName}>GetNotes</Text>
                        <View style={styles.taglinePill}>
                            <Text style={styles.tagline}>Your Academic Companion</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
    },
    menuButton: {
        position: 'absolute',
        left: spacing.screenPadding,
        top: 0,
        zIndex: 2,
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    notificationButton: {
        position: 'absolute',
        right: spacing.screenPadding,
        top: 0,
        zIndex: 2,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.35)',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#1A1A2E',
    },
    brandCard: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xs,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    logoBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    appName: {
        fontSize: 26,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.6,
    },
    taglinePill: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    tagline: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
    },
});
