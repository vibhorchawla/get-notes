import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    noPadding?: boolean;
    dark?: boolean;
}

export default function GlassCard({
    children,
    style,
    delay = 0,
    noPadding = false,
    dark = false,
}: GlassCardProps) {
    return (
        <View style={[styles.card, dark && styles.cardDark, noPadding && styles.cardFlush, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: colors.dark.cardBg,
        borderColor: colors.dark.cardBorder,
        shadowColor: colors.dark.shadow,
    },
    cardFlush: {
        padding: 0,
    },
});
