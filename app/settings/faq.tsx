import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const FAQ_ITEMS = [
    {
        q: 'How do I upload notes?',
        a: 'Tap the "+" button on the My Notes screen or use the FAB. Choose your file from Google Drive, add a title and description, then submit. Your notes will be searchable by other students.',
    },
    {
        q: 'Are my notes visible to everyone?',
        a: 'Only notes you explicitly upload and share become visible in community search. Your personal uploads remain private until you choose to share them.',
    },
    {
        q: 'How does Premium work?',
        a: 'Premium unlocks unlimited downloads, AI-powered summaries, and early access to new features. You can subscribe monthly, quarterly, or yearly.',
    },
    {
        q: 'Can I download notes offline?',
        a: 'Yes! Tap the download button on any note to save it for offline access. Your downloads are available in the Downloads section.',
    },
    {
        q: 'How do I reset my password?',
        a: 'On the login screen, tap "Forgot Password?" and follow the instructions sent to your email.',
    },
    {
        q: 'Is my data safe?',
        a: 'We use industry-standard encryption and security practices. Your personal information is never shared without your consent.',
    },
    {
        q: 'How do I delete my account?',
        a: `Contact our support team at ${process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'support@getnotes.app'} with your account details, and we will process your request within 48 hours.`,
    },
    {
        q: 'Can I edit or delete my uploaded notes?',
        a: 'Currently, uploaded notes cannot be edited after submission. You can contact support for deletion requests.',
    },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
    const [open, setOpen] = useState(false);
    const height = useSharedValue(0);
    const rotate = useSharedValue('0deg');

    const toggle = () => {
        setOpen(!open);
        height.value = withTiming(open ? 0 : 1, { duration: 300 });
        rotate.value = withSpring(open ? '0deg' : '180deg', { damping: 15 });
    };

    const animatedHeight = useAnimatedStyle(() => ({
        maxHeight: height.value === 0 ? 0 : 500,
        opacity: height.value,
        overflow: 'hidden',
    }));

    const animatedIcon = useAnimatedStyle(() => ({
        transform: [{ rotate: rotate.value }],
    }));

    return (
        <TouchableOpacity
            style={[styles.faqItem, index < FAQ_ITEMS.length - 1 && styles.faqBorder]}
            onPress={toggle}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${question}, ${open ? 'expanded' : 'collapsed'}`}
            accessibilityState={{ expanded: open }}
        >
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <Animated.View style={animatedIcon}>
                    <Ionicons name="chevron-down" size={18} color={colors.textLight} />
                </Animated.View>
            </View>
            <Animated.View style={animatedHeight}>
                <Text style={styles.faqAnswer}>{answer}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function FAQScreen() {
    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'FAQ', headerShown: true }} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.iconWrap}>
                        <Ionicons name="help-circle-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Frequently Asked Questions</Text>
                    <Text style={styles.subtitle}>Find answers to common questions about GetNotes.</Text>
                </View>

                <View style={styles.card}>
                    {FAQ_ITEMS.map((item, i) => (
                        <FAQItem key={i} question={item.q} answer={item.a} index={i} />
                    ))}
                </View>

                <View style={styles.contactCard}>
                    <Ionicons name="mail-outline" size={24} color={colors.primary} />
                    <View style={styles.contactText}>
                        <Text style={styles.contactTitle}>Still have questions?</Text>
                        <Text style={styles.contactSub}>Reach out to our support team</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    hero: { alignItems: 'center', paddingVertical: spacing.xl },
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    faqItem: { paddingVertical: spacing.md },
    faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        flex: 1,
        paddingRight: spacing.md,
    },
    faqAnswer: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
        marginTop: spacing.sm,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    contactText: { flex: 1 },
    contactTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    contactSub: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
});
