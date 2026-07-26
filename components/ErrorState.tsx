import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export default function ErrorState({
    title = 'Something went wrong',
    message = 'We could not load this content. Please check your connection and try again.',
    onRetry,
    retryLabel = 'Try Again',
}: ErrorStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry ? (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={retryLabel}
                >
                    <Ionicons name="refresh-outline" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.retryButtonText}>{retryLabel}</Text>
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
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
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
        maxWidth: 300,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: 16,
        minHeight: 50,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    retryButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});
