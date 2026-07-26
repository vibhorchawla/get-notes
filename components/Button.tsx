import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    accessibilityLabel?: string;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    size = 'md',
    fullWidth = false,
    accessibilityLabel,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const sizeStyles = {
        sm: { paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: 12 },
        md: { paddingVertical: 14, paddingHorizontal: spacing.xl, borderRadius: 16 },
        lg: { paddingVertical: 16, paddingHorizontal: spacing.xxl, borderRadius: 16 },
    };

    const iconSizes = { sm: 16, md: 18, lg: 20 };
    const fontSizes = { sm: typography.fontSize.sm as number, md: typography.fontSize.md as number, lg: typography.fontSize.lg as number };

    const variantStyle = variant === 'primary'
        ? primaryStyles
        : variant === 'secondary'
        ? secondaryStyles
        : ghostStyles;

    const iconColor = variant === 'primary' ? colors.textOnPrimary : disabled ? colors.textLight : colors.textPrimary;
    const textColor = disabled ? colors.textLight : variantStyle.text.color;

    return (
        <TouchableOpacity
            style={[
                baseStyles.button,
                sizeStyles[size],
                variantStyle.button,
                isDisabled && baseStyles.disabled,
                fullWidth && baseStyles.fullWidth,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityState={{ disabled: isDisabled }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'primary' ? colors.textOnPrimary : colors.textPrimary} />
            ) : (
                <View style={baseStyles.content}>
                    {icon && iconPosition === 'left' ? (
                        <Ionicons name={icon} size={iconSizes[size]} color={iconColor} />
                    ) : null}
                    <Text style={[baseStyles.text, { color: textColor as string, fontSize: fontSizes[size] }]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' ? (
                        <Ionicons name={icon} size={iconSizes[size]} color={iconColor} />
                    ) : null}
                </View>
            )}
        </TouchableOpacity>
    );
}

const baseStyles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    text: {
        fontWeight: typography.fontWeight.semibold,
    },
});

const primaryStyles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    text: {
        color: colors.textOnPrimary,
    },
});

const secondaryStyles = StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    text: {
        color: colors.textPrimary,
    },
});

const ghostStyles = StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
    },
    text: {
        color: colors.textPrimary,
    },
});
