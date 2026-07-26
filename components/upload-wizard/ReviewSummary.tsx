import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface ReviewField {
    label: string;
    value: string;
    onEdit?: () => void;
}

interface ReviewSummaryProps {
    fields: ReviewField[];
    fileName?: string;
    onEditField?: (fieldIndex: number) => void;
    dark?: boolean;
}

function ReviewFieldRow({
    field,
    index,
    onEdit,
    dark,
}: {
    field: ReviewField;
    index: number;
    onEdit?: () => void;
    dark: boolean;
}) {
    const d = colors.dark;

    return (
        <View style={[styles.fieldRow, dark && styles.fieldRowDark]}>
            <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, dark && styles.fieldLabelDark]}>{field.label}</Text>
                <Text style={[styles.fieldValue, dark && styles.fieldValueDark]}>{field.value}</Text>
            </View>
            {field.onEdit ? (
                <Pressable
                    style={[styles.editBtn, dark && styles.editBtnDark]}
                    onPress={field.onEdit}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${field.label}`}
                >
                    <Ionicons name="pencil" size={14} color={dark ? d.primary : colors.primary} />
                    <Text style={[styles.editBtnText, dark && styles.editBtnTextDark]}>Edit</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export default function ReviewSummary({
    fields,
    fileName,
    onEditField,
    dark = false,
}: ReviewSummaryProps) {
    const d = colors.dark;

    return (
        <View style={[styles.container, dark && styles.containerDark]}>
            <View style={styles.header}>
                <Ionicons name="document-text" size={20} color={dark ? d.primary : colors.primary} />
                <Text style={[styles.headerTitle, dark && styles.headerTitleDark]}>Review Selection</Text>
            </View>

            <View style={styles.fieldsContainer}>
                {fields.map((field, i) => (
                    <ReviewFieldRow
                        key={field.label}
                        field={field}
                        index={i}
                        onEdit={field.onEdit}
                        dark={dark}
                    />
                ))}
            </View>

            {fileName ? (
                <View style={[styles.fileRow, dark && styles.fileRowDark]}>
                    <View style={[styles.fileIconWrap, dark && styles.fileIconWrapDark]}>
                        <Ionicons name="document-attach" size={18} color={dark ? d.accent : colors.accent} />
                    </View>
                    <View style={styles.fileInfo}>
                        <Text style={[styles.fileName, dark && styles.fileNameDark]} numberOfLines={1}>{fileName}</Text>
                        <Text style={[styles.fileStatus, dark && styles.fileStatusDark]}>Ready to upload</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={dark ? d.accent : colors.accent} />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    containerDark: {
        backgroundColor: colors.dark.cardBg,
        borderColor: colors.dark.cardBorder,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        paddingBottom: spacing.md - 4,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    headerTitleDark: {
        color: colors.dark.text,
    },
    fieldsContainer: {
        paddingHorizontal: spacing.md,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    },
    fieldRowDark: {
        borderBottomColor: colors.dark.border,
    },
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    fieldLabelDark: {
        color: colors.dark.textSecondary,
    },
    fieldValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    fieldValueDark: {
        color: colors.dark.text,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        backgroundColor: 'rgba(91, 127, 255, 0.08)',
    },
    editBtnDark: {
        backgroundColor: colors.dark.chipBg,
    },
    editBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    editBtnTextDark: {
        color: colors.dark.primary,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        marginTop: spacing.xs,
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(226, 232, 240, 0.5)',
    },
    fileRowDark: {
        backgroundColor: 'rgba(0, 230, 118, 0.06)',
        borderTopColor: colors.dark.border,
    },
    fileIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileIconWrapDark: {
        backgroundColor: 'rgba(0, 230, 118, 0.12)',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    fileNameDark: {
        color: colors.dark.text,
    },
    fileStatus: {
        fontSize: typography.fontSize.xs,
        color: colors.accent,
        marginTop: 2,
    },
    fileStatusDark: {
        color: colors.dark.accent,
    },
});
