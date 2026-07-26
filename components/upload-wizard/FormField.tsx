import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface FormFieldProps extends TextInputProps {
    label: string;
    required?: boolean;
    hint?: string;
    dark?: boolean;
}

export default function FormField({
    label,
    required = false,
    hint,
    style,
    dark = false,
    ...props
}: FormFieldProps) {
    const d = colors.dark;

    return (
        <View style={styles.field}>
            <Text style={[styles.label, dark && styles.labelDark]}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            <TextInput
                style={[styles.input, dark && styles.inputDark, style]}
                placeholderTextColor={dark ? d.textMuted : colors.textLight}
                accessibilityLabel={label}
                {...props}
            />
            {hint ? <Text style={[styles.hint, dark && styles.hintDark]}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    labelDark: {
        color: colors.dark.textSecondary,
    },
    required: {
        color: colors.error,
    },
    input: {
        backgroundColor: colors.cardBackgroundSecondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
    inputDark: {
        backgroundColor: colors.dark.inputBg,
        borderColor: colors.dark.inputBorder,
        color: colors.dark.text,
    },
    hint: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    hintDark: {
        color: colors.dark.textMuted,
    },
});
