import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface NoteItemProps {
    title: string;
    subject: string;
    unit?: string;
    onPress?: () => void;
    onDownload?: () => void;
}

export default function NoteItem({
    title,
    subject,
    unit,
    onPress,
    onDownload,
}: NoteItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <View style={styles.meta}>
                    <Text style={styles.subject}>{subject}</Text>
                    {unit && (
                        <>
                            <Text style={styles.separator}>•</Text>
                            <Text style={styles.unit}>{unit}</Text>
                        </>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={styles.downloadButton}
                onPress={(e) => {
                    e.stopPropagation();
                    onDownload?.();
                }}
            >
                <Ionicons name="download-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subject: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    separator: {
        marginHorizontal: spacing.xs,
        color: colors.textLight,
    },
    unit: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    downloadButton: {
        padding: spacing.sm,
    },
});
