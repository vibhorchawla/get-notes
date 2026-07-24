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
}

export default function ProgressIndicator({
    label,
    percent,
    statusText,
}: ProgressIndicatorProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="cloud-upload" size={18} color={colors.primary} />
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.percent}>{percent}%</Text>
            </View>

            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
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
                        percent >= 100 ? styles.dotSuccess : styles.dotActive,
                    ]}
                />
                <Text style={styles.statusText}>{statusText}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(79, 70, 229, 0.06)',
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.12)',
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
    percent: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    track: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.primary,
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
    dotSuccess: {
        backgroundColor: colors.accent,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
});
