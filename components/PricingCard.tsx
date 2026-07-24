import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: { label: string; included: boolean }[];
    highlighted?: boolean;
    accentColor?: string;
    onPress?: () => void;
    loading?: boolean;
    disabled?: boolean;
    buttonLabel?: string;
}

export default function PricingCard({
    title,
    price,
    period,
    description,
    features,
    highlighted = false,
    accentColor = '#7C3AED',
    onPress,
    loading = false,
    disabled = false,
    buttonLabel,
}: PricingCardProps) {
    const btnLabel = buttonLabel || (highlighted ? 'Get Started' : 'Get Started');

    return (
        <View style={[styles.card, highlighted && styles.cardHighlighted]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={[styles.dot, { backgroundColor: accentColor }]} />
                    <Text style={styles.title}>{title}</Text>
                </View>
            </View>

            <View style={styles.priceSection}>
                <Text style={styles.price}>{price}</Text>
                <Text style={styles.period}>{period}</Text>
            </View>

            <Text style={styles.description}>{description}</Text>

            {onPress && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        highlighted && { backgroundColor: accentColor },
                        disabled && styles.buttonDisabled,
                    ]}
                    onPress={onPress}
                    activeOpacity={0.8}
                    disabled={disabled}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.buttonText, highlighted && styles.buttonTextHighlighted, disabled && styles.buttonTextDisabled]}>
                            {btnLabel}
                        </Text>
                    )}
                </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                    <Ionicons
                        name={feature.included ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={feature.included ? accentColor : 'rgba(255,255,255,0.25)'}
                    />
                    <Text style={[styles.featureLabel, !feature.included && styles.featureLabelDisabled]}>
                        {feature.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardHighlighted: {
        borderColor: 'rgba(124, 58, 237, 0.35)',
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
    },
    header: {
        marginBottom: spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: 0.5,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    price: {
        fontSize: 36,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    period: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        marginLeft: 4,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: spacing.md,
    },
    button: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: spacing.md,
        minHeight: 46,
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    buttonTextHighlighted: {
        color: '#FFFFFF',
    },
    buttonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: spacing.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: 5,
    },
    featureLabel: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.7)',
        flex: 1,
    },
    featureLabelDisabled: {
        color: 'rgba(255, 255, 255, 0.25)',
    },
});
