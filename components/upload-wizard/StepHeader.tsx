import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface StepHeaderProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    delay?: number;
    dark?: boolean;
}

export default function StepHeader({
    icon,
    title,
    subtitle,
    delay = 80,
    dark = false,
}: StepHeaderProps) {
    const d = colors.dark;

    return (
        <View style={styles.container}>
            <View style={[styles.iconWrap, dark && styles.iconWrapDark]}>
                <Ionicons name={icon} size={22} color={dark ? d.primary : colors.primary} />
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
                {subtitle ? <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(91, 127, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapDark: {
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    titleDark: {
        color: colors.dark.text,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    subtitleDark: {
        color: colors.dark.textSecondary,
    },
});
