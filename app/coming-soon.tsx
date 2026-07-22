import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function ComingSoonScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'Coming Soon', headerShown: true }} />
            <View style={styles.content}>
                <View style={styles.iconWrap}>
                    <Ionicons name="construct-outline" size={64} color={colors.primary} />
                </View>
                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>We're working hard to bring you this feature. Stay tuned!</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()} activeOpacity={0.85}>
                    <Ionicons name="arrow-back" size={20} color={colors.textOnPrimary} />
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
    },
    iconWrap: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 14,
        marginTop: spacing.lg,
    },
    buttonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
});
