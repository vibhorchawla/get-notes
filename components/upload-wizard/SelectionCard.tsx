import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface SelectionCardProps {
    id: string;
    name: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    isSelected: boolean;
    isCompleted?: boolean;
    onPress: () => void;
    index?: number;
    accentColor?: string;
}

export default function SelectionCard({
    id,
    name,
    subtitle,
    icon = 'checkmark-circle-outline',
    isSelected,
    isCompleted = false,
    onPress,
    index = 0,
    accentColor = colors.primary,
}: SelectionCardProps) {
    return (
        <Pressable
            style={[
                styles.card,
                {
                    borderColor: isSelected ? accentColor : colors.border,
                    backgroundColor: isSelected ? `${accentColor}10` : colors.background,
                },
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${name}${subtitle ? `, ${subtitle}` : ''}`}
            accessibilityState={{ selected: isSelected }}
        >
            <View style={styles.iconWrap}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={isSelected ? accentColor : colors.textLight}
                />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, isSelected && styles.nameSelected]}>
                    {name}
                </Text>
                {subtitle ? (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                ) : null}
            </View>
            <View style={styles.checkWrap}>
                {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                ) : isSelected ? (
                    <View style={styles.radioOuter}>
                        <View style={styles.radioInner} />
                    </View>
                ) : (
                    <View style={styles.radioEmpty} />
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: spacing.sm,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    nameSelected: {
        color: colors.primary,
    },
    subtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    checkWrap: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    radioEmpty: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border,
    },
});
