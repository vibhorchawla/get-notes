import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function OfflineBanner() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <View style={styles.banner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
            <Text style={styles.text}>You are offline. Some features may be unavailable.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#991B1B',
        paddingHorizontal: spacing.screenPadding,
        paddingVertical: spacing.sm,
    },
    text: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        flex: 1,
    },
});
