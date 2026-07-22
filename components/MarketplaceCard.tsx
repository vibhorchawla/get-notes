import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface MarketplaceCardProps {
    title: string;
    category: string;
    rating: number;
    students: string;
    instructor: string;
    icon: string;
    imageUrl?: string;
    onPress: () => void;
    horizontal?: boolean;
}

export default function MarketplaceCard({
    title,
    category,
    rating,
    students,
    instructor,
    icon,
    imageUrl,
    onPress,
    horizontal = false,
}: MarketplaceCardProps) {
    return (
        <TouchableOpacity
            style={[styles.container, horizontal ? styles.horizontalContainer : styles.verticalContainer]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${category}, ${rating} stars`}
        >
            <View style={[styles.imagePlaceholder, horizontal ? styles.horizontalImage : styles.verticalImage]}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFillObject} />
                ) : (
                    <Ionicons name={icon as any} size={32} color={colors.primary} />
                )}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{category}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.instructor}>{instructor}</Text>

                <View style={styles.meta}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.students}>{students} students</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    verticalContainer: {
        width: '100%',
        marginBottom: spacing.md,
    },
    horizontalContainer: {
        width: 260,
        marginRight: spacing.md,
    },
    imagePlaceholder: {
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    verticalImage: {
        height: 140,
    },
    horizontalImage: {
        height: 120,
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    details: {
        padding: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
        lineHeight: 22,
    },
    instructor: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    dot: {
        marginHorizontal: 6,
        color: colors.textLight,
    },
    students: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
