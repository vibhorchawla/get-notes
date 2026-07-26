import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface ProgressIndicatorProps {
    label: string;
    percent: number;
    statusText: string;
    dark?: boolean;
}

export default function ProgressIndicator({
    label,
    percent,
    statusText,
    dark = false,
}: ProgressIndicatorProps) {
    const d = colors.dark;

    return (
        <View style={[styles.container, dark && styles.containerDark]}>
            <View style={styles.header}>
                <Ionicons name="cloud-upload" size={18} color={dark ? d.primary : colors.primary} />
                <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
                <Text style={[styles.percent, dark && styles.percentDark]}>{percent}%</Text>
            </View>

            <View style={[styles.track, dark && styles.trackDark]}>
                <View
                    style={[
                        styles.fill,
                        dark && styles.fillDark,
                        {
                            width: `${Math.min(percent, 100)}%` as any,
                        },
                    ]}
                />
            </View>

            <View style={styles.statusRow}>
                <View
                    style={[
                        styles.dot,
                        percent >= 100
                            ? (dark ? styles.dotSuccessDark : styles.dotSuccess)
                            : (dark ? styles.dotActiveDark : styles.dotActive),
                    ]}
                />
                <Text style={[styles.statusText, dark && styles.statusTextDark]}>{statusText}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(91, 127, 255, 0.06)',
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(91, 127, 255, 0.12)',
    },
    containerDark: {
        backgroundColor: colors.dark.chipBg,
        borderColor: colors.dark.chipBorder,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    label: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    labelDark: {
        color: colors.dark.text,
    },
    percent: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    percentDark: {
        color: colors.dark.primary,
    },
    track: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
        overflow: 'hidden',
    },
    trackDark: {
        backgroundColor: colors.dark.progressTrack,
    },
    fill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    fillDark: {
        backgroundColor: colors.dark.progressFill,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dotActive: {
        backgroundColor: colors.primary,
    },
    dotActiveDark: {
        backgroundColor: colors.dark.primary,
    },
    dotSuccess: {
        backgroundColor: colors.accent,
    },
    dotSuccessDark: {
        backgroundColor: colors.dark.accent,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    statusTextDark: {
        color: colors.dark.textSecondary,
    },
});
