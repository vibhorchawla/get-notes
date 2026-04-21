import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function Header() {
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    return (
        <View style={styles.outerContainer}>
            <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={styles.menuButton}
                activeOpacity={0.8}
            >
                <Ionicons name="menu" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(40).springify().damping(14)} style={styles.container}>
                <View style={styles.brandRow}>
                    <View style={styles.logoMark}>
                        <Ionicons name="library-outline" size={24} color={colors.textOnPrimary} />
                    </View>
                    <View>
                        <Text style={styles.appName}>GetNotes</Text>
                        <Text style={styles.tagline}>Smart academic discovery and note sharing</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: spacing.sm,
        marginBottom: spacing.md,
    },
    menuButton: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.screenPadding,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    container: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.screenPadding,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: spacing.md,
    },
    logoMark: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#312E81',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 4,
    },
    appName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.8,
    },
    tagline: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
});
