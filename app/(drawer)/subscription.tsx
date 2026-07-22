import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PricingCard from '../../components/PricingCard';
import { useAuth } from '../../context/AuthContext';
import { usePayment, PlanId } from '../../hooks/usePayment';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface PlanConfig {
    id: PlanId;
    title: string;
    price: string;
    yearlyPrice: string;
    period: string;
    description: string;
    accentColor: string;
    features: { label: string; included: boolean }[];
    savings?: string;
}

const PLANS: PlanConfig[] = [
    {
        id: 'monthly',
        title: 'MONTHLY',
        price: '₹49',
        yearlyPrice: '₹499',
        period: '/month',
        description: 'Perfect for trying Premium',
        accentColor: '#6D28D9',
        features: [
            { label: 'Unlimited notes access', included: true },
            { label: 'Download notes offline', included: true },
            { label: 'Priority support', included: true },
            { label: 'AI summaries', included: true },
            { label: '50 Custom collections', included: true },
            { label: 'Cancel anytime', included: true },
        ],
    },
    {
        id: 'quarterly',
        title: 'QUARTERLY',
        price: '₹129',
        yearlyPrice: '₹1,099',
        period: '/3 months',
        description: 'Best value for serious learners',
        accentColor: '#7C3AED',
        features: [
            { label: 'Everything in Monthly', included: true },
            { label: 'Save ₹18/month', included: true },
            { label: '24/7 priority support', included: true },
            { label: 'AI summaries', included: true },
            { label: 'Unlimited collections', included: true },
            { label: 'Early access to new features', included: true },
        ],
        savings: 'Save 12%',
    },
    {
        id: 'yearly',
        title: 'YEARLY',
        price: '₹399',
        yearlyPrice: '₹3,499',
        period: '/year',
        description: 'Ultimate learning experience',
        accentColor: '#5B21B6',
        features: [
            { label: 'Everything in Quarterly', included: true },
            { label: 'Best price — ₹33/month', included: true },
            { label: 'Exclusive premium notes', included: true },
            { label: 'Priority 24/7 support', included: true },
            { label: 'Real-time collaboration', included: true },
            { label: 'Group study rooms', included: true },
        ],
        savings: 'Save 32%',
    },
];

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SubscriptionScreen() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const { buyPremium, isLoading: paymentLoading } = usePayment();
    const [isYearly, setIsYearly] = useState(false);

    const now = new Date();
    const isPremium = user?.isPremium ?? false;
    const premiumEnd = user?.premiumEndDate ? new Date(user.premiumEndDate) : null;
    const isExpired = premiumEnd ? premiumEnd < now : false;
    const premiumActive = isPremium && !isExpired;

    const handleBuy = async (planId: PlanId) => {
        const success = await buyPremium(planId);
        if (success) {
            await refreshUser();
        }
    };

    return (
        <View style={styles.darkRoot}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Subscription</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {premiumActive && (
                        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.premiumBanner}>
                            <Ionicons name="diamond" size={20} color="#FFFFFF" />
                            <View style={styles.premiumBannerTextWrap}>
                                <Text style={styles.premiumBannerText}>Premium Active</Text>
                                <Text style={styles.premiumBannerSub}>
                                    {user?.premiumPlan ? `${user.premiumPlan.charAt(0).toUpperCase() + user.premiumPlan.slice(1)} plan` : ''} — Expires {formatDate(user?.premiumEndDate)}
                                </Text>
                            </View>
                        </Animated.View>
                    )}

                    {isExpired && (
                        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.expiredBanner}>
                            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                            <Text style={styles.expiredBannerText}>Your premium plan has expired. Renew now!</Text>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
                        <Text style={styles.heading}>
                            {premiumActive ? 'Manage your plan' : 'Upgrade to Premium'}
                        </Text>
                        <Text style={styles.subheading}>
                            {premiumActive
                                ? 'You have full access to all features.'
                                : 'Unlock unlimited notes, AI summaries, and more.'}
                        </Text>
                    </Animated.View>

                    <View style={styles.cardsContainer}>
                        {PLANS.map((plan, index) => {
                            const disabled = premiumActive && user?.premiumPlan === plan.id;
                            const isLoadingThis = paymentLoading;
                            return (
                                <Animated.View
                                    key={plan.id}
                                    entering={FadeInDown.delay(200 + index * 100).springify().damping(14)}
                                >
                                    <PricingCard
                                        title={plan.title}
                                        price={plan.price}
                                        period={plan.period}
                                        description={plan.description}
                                        features={plan.features}
                                        highlighted={plan.id === 'quarterly'}
                                        accentColor={plan.accentColor}
                                        onPress={!premiumActive ? () => handleBuy(plan.id) : undefined}
                                        loading={isLoadingThis}
                                        disabled={disabled || paymentLoading}
                                        buttonLabel={
                                            disabled
                                                ? 'Current Plan'
                                                : premiumActive
                                                    ? 'Upgrade'
                                                    : 'Buy Premium'
                                        }
                                    />
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    darkRoot: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    headerPlaceholder: {
        width: 40,
    },
    premiumBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderRadius: 14,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    premiumBannerTextWrap: {
        flex: 1,
    },
    premiumBannerText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: '#FFFFFF',
    },
    premiumBannerSub: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    expiredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 14,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    expiredBannerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: '#F59E0B',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xxl,
    },
    heading: {
        fontSize: typography.fontSize.xxl + 4,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: spacing.md,
    },
    subheading: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    cardsContainer: {
        gap: spacing.md,
    },
});
