import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

interface FloatingActionButtonProps {
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
}

export default function FloatingActionButton({ onPress, iconName = 'add' }: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            style={styles.fab}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Add new note"
            activeOpacity={0.8}
        >
            <Ionicons name={iconName} size={28} color={colors.textOnPrimary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: spacing.xxl,
        right: spacing.xl,
        backgroundColor: colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 10,
        zIndex: 100,
    },
});
