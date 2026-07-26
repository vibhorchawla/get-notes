import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface GradientButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    dark?: boolean;
}

export default function GradientButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    loadingLabel,
    icon,
    style,
    dark = false,
}: GradientButtonProps) {
    const d = colors.dark;

    return (
        <Pressable
            style={[styles.wrapper, style]}
            onPress={() => {
                if (!disabled && !loading) onPress();
            }}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? loadingLabel || 'Loading' : label}
            accessibilityState={{ disabled, busy: loading }}
        >
            <LinearGradient
                colors={
                    disabled
                        ? (dark ? [d.border, d.border] : [colors.border, colors.border])
                        : dark
                        ? [d.primary, d.primaryDark]
                        : ['#5B7FFF', '#4F70F7']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={dark ? d.textOnAccent : colors.textOnPrimary} />
                ) : icon ? (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={disabled
                            ? (dark ? d.textMuted : colors.textLight)
                            : (dark ? d.textOnAccent : colors.textOnPrimary)
                        }
                    />
                ) : null}
                <Text
                    style={[
                        styles.label,
                        disabled && styles.labelDisabled,
                        dark && { color: disabled ? d.textMuted : d.textOnAccent },
                    ]}
                >
                    {loading ? loadingLabel || 'Processing...' : label}
                </Text>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: 18,
        paddingHorizontal: spacing.lg,
        minHeight: 58,
    },
    label: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textOnPrimary,
        letterSpacing: 0.3,
    },
    labelDisabled: {
        color: colors.textLight,
    },
});
