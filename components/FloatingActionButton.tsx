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
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <Ionicons name={iconName} size={28} color={colors.textPrimary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: spacing.xxl,
        right: spacing.xl,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 100, // Ensure it sits on top
    },
});
