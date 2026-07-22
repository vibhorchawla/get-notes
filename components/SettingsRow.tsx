import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface SettingsRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightContent?: React.ReactNode;
    toggle?: { value: boolean; onValueChange: (v: boolean) => void };
    destructive?: boolean;
}

export default function SettingsRow({
    icon,
    label,
    description,
    onPress,
    showChevron = true,
    rightContent,
    toggle,
    destructive,
}: SettingsRowProps) {
    const content = (
        <View style={[styles.row, destructive && styles.destructiveRow]}>
            <View style={styles.left}>
                <View style={[styles.iconWrap, destructive && styles.destructiveIcon]}>
                    <Ionicons
                        name={icon}
                        size={22}
                        color={destructive ? colors.error : colors.primary}
                    />
                </View>
                <View style={styles.textWrap}>
                    <Text style={[styles.label, destructive && styles.destructiveLabel]}>{label}</Text>
                    {description ? <Text style={styles.description}>{description}</Text> : null}
                </View>
            </View>
            {toggle ? (
                <Switch
                    value={toggle.value}
                    onValueChange={toggle.onValueChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    accessibilityRole="switch"
                    accessibilityLabel={label}
                />
            ) : rightContent ? (
                rightContent
            ) : showChevron ? (
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            ) : null}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        minHeight: 56,
    },
    destructiveRow: {
        opacity: 0.9,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    destructiveIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    textWrap: {
        flex: 1,
    },
    label: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
    destructiveLabel: {
        color: colors.error,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
});
