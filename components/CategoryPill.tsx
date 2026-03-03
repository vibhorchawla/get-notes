import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface CategoryPillProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export default function CategoryPill({ label, isActive, onPress }: CategoryPillProps) {
    return (
        <TouchableOpacity
            style={[styles.container, isActive && styles.activeContainer]}
            onPress={onPress}
        >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeContainer: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    activeLabel: {
        color: colors.textPrimary,
    },
});
