import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface CategoryPillProps {
    label: string;
    icon?: string;
    isActive: boolean;
    onPress: () => void;
}

export default function CategoryPill({ label, icon, isActive, onPress }: CategoryPillProps) {
    return (
        <TouchableOpacity
            style={[styles.container, isActive && styles.activeContainer]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${label}${isActive ? ', selected' : ''}`}
            accessibilityState={{ selected: isActive }}
        >
            <View style={styles.content}>
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={15}
                        color={isActive ? colors.textOnPrimary : colors.textSecondary}
                        style={styles.icon}
                    />
                )}
                <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        borderRadius: 24,
        backgroundColor: colors.cardBackground,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeContainer: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 6,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    activeLabel: {
        color: colors.textOnPrimary,
        fontWeight: typography.fontWeight.bold,
    },
});
