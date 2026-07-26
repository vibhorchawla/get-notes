import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return <Redirect href={user ? '/home' : '/onboarding'} />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
