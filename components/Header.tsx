import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function Header() {
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={styles.menuButton}
                activeOpacity={0.8}
            >
                <Ionicons name="menu" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(40).springify().damping(14)} style={styles.brandBlock}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="library" size={24} color={colors.textOnPrimary} />
                    </View>
                    <Text style={styles.appName}>GetNotes</Text>
                </View>
                <Text style={styles.tagline}>Your Academic Companion</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.md,
        minHeight: 96,
    },
    menuButton: {
        position: 'absolute',
        left: spacing.screenPadding,
        top: spacing.md,
        zIndex: 2,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    brandBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.sm,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    logoBadge: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#312E81',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 4,
    },
    appName: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.8,
    },
    tagline: {
        marginTop: 6,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});
