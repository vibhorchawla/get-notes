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
                <Ionicons name="menu" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(40).springify().damping(14)} style={styles.brandCard}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="library" size={18} color={colors.textOnPrimary} />
                    </View>
                    <View>
                        <Text style={styles.appName}>GetNotes</Text>
                        <Text style={styles.tagline}>Your Academic Companion</Text>
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
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    appName: {
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        fontWeight: typography.fontWeight.medium,
        marginTop: 1,
    },
});
