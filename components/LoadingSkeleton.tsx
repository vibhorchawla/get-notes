import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

const SHIMMER_COLOR = 'rgba(255, 255, 255, 0.04)';
const HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.06)';

interface SkeletonBlockProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: object;
}

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonBlockProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[{ width: width as any, height, borderRadius, backgroundColor: SHIMMER_COLOR, opacity }, style]}
        />
    );
}

interface SkeletonCardProps {
    lines?: number;
}

function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.row}>
                <SkeletonBlock width={44} height={44} borderRadius={14} />
                <View style={cardStyles.content}>
                    <SkeletonBlock width="80%" height={16} />
                    <View style={{ height: spacing.xs }} />
                    <SkeletonBlock width="50%" height={12} borderRadius={6} />
                </View>
            </View>
            {Array.from({ length: lines - 1 }).map((_, i) => (
                <View key={i} style={{ marginTop: spacing.sm }}>
                    <SkeletonBlock width={i === lines - 2 ? '60%' : '100%'} height={12} borderRadius={6} />
                </View>
            ))}
        </View>
    );
}

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.cardPadding,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
});

function SkeletonCourseCard() {
    return (
        <View style={courseStyles.card}>
            <SkeletonBlock width="100%" height={140} borderRadius={20} />
            <View style={courseStyles.body}>
                <SkeletonBlock width="90%" height={16} />
                <View style={{ height: spacing.xs }} />
                <SkeletonBlock width="60%" height={12} borderRadius={6} />
                <View style={{ height: spacing.sm }} />
                <SkeletonBlock width="40%" height={12} borderRadius={6} />
            </View>
        </View>
    );
}

const courseStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    body: {
        padding: spacing.cardPadding,
    },
});

function SkeletonProfileHeader() {
    return (
        <View style={profileStyles.card}>
            <SkeletonBlock width={128} height={128} borderRadius={64} />
            <View style={{ height: spacing.md }} />
            <SkeletonBlock width="50%" height={20} borderRadius={10} />
            <View style={{ height: spacing.xs }} />
            <SkeletonBlock width="40%" height={14} borderRadius={7} />
        </View>
    );
}

const profileStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
});

export const LoadingSkeleton = {
    Card: SkeletonCard,
    CourseCard: SkeletonCourseCard,
    ProfileHeader: SkeletonProfileHeader,
    Block: SkeletonBlock,
};

export default LoadingSkeleton;
