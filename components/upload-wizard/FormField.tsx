import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface FormFieldProps extends TextInputProps {
    label: string;
    required?: boolean;
    hint?: string;
}

export default function FormField({
    label,
    required = false,
    hint,
    style,
    ...props
}: FormFieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={colors.textLight}
                accessibilityLabel={label}
                {...props}
            />
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
    required: {
        color: colors.error,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
    hint: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
});
