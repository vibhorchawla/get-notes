import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence,
    Easing 
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function Header() {
    const translateY = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(10);

    useEffect(() => {
        // Logo floating animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Infinite loop
            true // Reverse
        );

        // Text fade-in and slide-up on mount
        textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        textTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        };
    });

    const navigation = useNavigation<DrawerNavigationProp<any>>();

    return (
        <View style={styles.outerContainer}>
            <TouchableOpacity 
                onPress={() => navigation.openDrawer()} 
                style={styles.menuButton}
                activeOpacity={0.7}
            >
                <Ionicons name="menu" size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Animated.View style={[styles.logoPlaceholder, animatedStyle]}>
                        <Text style={styles.logoText}>📚</Text>
                    </Animated.View>
                    <Animated.Text style={[styles.appName, textAnimatedStyle]}>GetNotes</Animated.Text>
                </View>
                <Animated.Text style={[styles.tagline, textAnimatedStyle]}>Your Academic Companion</Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'relative',
        width: '100%',
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
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    container: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    logoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
        // Add subtle shadow for premium feel
        shadowColor: colors.textPrimary || '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    logoText: {
        fontSize: 30,
    },
    appName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    tagline: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});
