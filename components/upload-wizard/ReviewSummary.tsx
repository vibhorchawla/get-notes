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
}

function ReviewFieldRow({
    field,
    index,
    onEdit,
}: {
    field: ReviewField;
    index: number;
    onEdit?: () => void;
}) {
    return (
        <View style={styles.fieldRow}>
            <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
            </View>
            {field.onEdit ? (
                <Pressable
                    style={styles.editBtn}
                    onPress={field.onEdit}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${field.label}`}
                >
                    <Ionicons name="pencil" size={14} color={colors.primary} />
                    <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export default function ReviewSummary({
    fields,
    fileName,
    onEditField,
}: ReviewSummaryProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={styles.headerTitle}>Review Selection</Text>
            </View>

            <View style={styles.fieldsContainer}>
                {fields.map((field, i) => (
                    <ReviewFieldRow
                        key={field.label}
                        field={field}
                        index={i}
                        onEdit={field.onEdit}
                    />
                ))}
            </View>

            {fileName ? (
                <View style={styles.fileRow}>
                    <View style={styles.fileIconWrap}>
                        <Ionicons name="document-attach" size={18} color={colors.accent} />
                    </View>
                    <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                        <Text style={styles.fileStatus}>Ready to upload</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
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
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    editBtnText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
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
    fileIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    fileStatus: {
        fontSize: typography.fontSize.xs,
        color: colors.accent,
        marginTop: 2,
    },
});
