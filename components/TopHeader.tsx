import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface TopHeaderProps {
    title: string;
    showMenu?: boolean;
}

export default function TopHeader({ title, showMenu = true }: TopHeaderProps) {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
            {showMenu ? (
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    style={styles.btn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Open navigation menu"
                >
                    <Ionicons name="menu" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <Text style={styles.title}>{title}</Text>

            <View style={styles.placeholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.sm,
        backgroundColor: 'transparent',
    },
    btn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    placeholder: {
        width: 42,
    },
});
