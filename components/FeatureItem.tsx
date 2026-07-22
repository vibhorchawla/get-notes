import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface FeatureItemProps {
    label: string;
    included?: boolean;
}

export default function FeatureItem({ label, included = true }: FeatureItemProps) {
    return (
        <View style={styles.container}>
            <View style={[styles.iconWrap, !included && styles.iconWrapDisabled]}>
                <Ionicons
                    name={included ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={included ? colors.primary : colors.textLight}
                />
            </View>
            <Text style={[styles.label, !included && styles.labelDisabled]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: 6,
    },
    iconWrap: {
        width: 20,
        alignItems: 'center',
    },
    iconWrapDisabled: {
        opacity: 0.5,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        flex: 1,
    },
    labelDisabled: {
        color: colors.textLight,
    },
});
