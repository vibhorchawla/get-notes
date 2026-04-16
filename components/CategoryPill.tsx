import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface CategoryPillProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: () => void;
}

export default function CategoryPill({ label, icon, isActive, onPress }: CategoryPillProps) {
    return (
        <TouchableOpacity
            style={[styles.container, isActive && styles.activeContainer]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {icon && (
                    <Ionicons 
                        name={icon} 
                        size={16} 
                        color={isActive ? colors.textOnPrimary : colors.primary} 
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
        paddingHorizontal: spacing.lg || 24,
        paddingVertical: spacing.sm || 8,
        borderRadius: 24,
        backgroundColor: colors.cardBackground,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeContainer: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        elevation: 4,
        shadowOpacity: 0.15,
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
