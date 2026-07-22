import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface EmptyStateProps {
    icon: string;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

export default function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon as any} size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {actionLabel && onAction ? (
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onAction}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Ionicons name="add-circle-outline" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
            {secondaryActionLabel && onSecondaryAction ? (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSecondaryAction}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={secondaryActionLabel}
                >
                    <Ionicons name="refresh-outline" size={18} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
    },
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
        maxWidth: 280,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: 14,
        minHeight: 50,
    },
    primaryButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        paddingHorizontal: spacing.xl,
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: spacing.sm,
        minHeight: 48,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});
