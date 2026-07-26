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
    dark?: boolean;
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
    dark = false,
}: SelectionCardProps) {
    const d = colors.dark;

    return (
        <Pressable
            style={[
                styles.card,
                dark && styles.cardDark,
                {
                    borderColor: isSelected
                        ? (dark ? d.selectedBorder : accentColor)
                        : (dark ? d.border : colors.border),
                    backgroundColor: isSelected
                        ? (dark ? d.selectedBg : `${accentColor}10`)
                        : (dark ? d.surface : colors.background),
                },
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${name}${subtitle ? `, ${subtitle}` : ''}`}
            accessibilityState={{ selected: isSelected }}
        >
            <View style={[styles.iconWrap, dark && styles.iconWrapDark]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={isSelected
                        ? (dark ? d.primary : accentColor)
                        : (dark ? d.textMuted : colors.textLight)
                    }
                />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, dark && styles.nameDark, isSelected && (dark ? styles.nameSelectedDark : styles.nameSelected)]}>
                    {name}
                </Text>
                {subtitle ? (
                    <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
                ) : null}
            </View>
            <View style={styles.checkWrap}>
                {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={22} color={dark ? d.accent : colors.accent} />
                ) : isSelected ? (
                    <View style={[styles.radioOuter, dark && { borderColor: d.primary }]}>
                        <View style={[styles.radioInner, dark && { backgroundColor: d.primary }]} />
                    </View>
                ) : (
                    <View style={[styles.radioEmpty, dark && { borderColor: d.border }]} />
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
    cardDark: {
        // Dark overrides applied inline
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(91, 127, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapDark: {
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    nameDark: {
        color: colors.dark.text,
    },
    nameSelected: {
        color: colors.primary,
    },
    nameSelectedDark: {
        color: colors.dark.primary,
    },
    subtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    subtitleDark: {
        color: colors.dark.textSecondary,
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
