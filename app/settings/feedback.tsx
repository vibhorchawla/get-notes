import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';

const FEEDBACK_TYPES = [
    { key: 'bug', label: 'Bug Report', icon: 'bug-outline' },
    { key: 'feature', label: 'Feature Request', icon: 'bulb-outline' },
    { key: 'improvement', label: 'Improvement', icon: 'trending-up-outline' },
    { key: 'other', label: 'Other', icon: 'chatbubble-ellipses-outline' },
] as const;

export default function FeedbackScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const [type, setType] = useState<string>('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            showToast('Please enter your feedback message.', 'error');
            return;
        }
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSubmitting(false);
        showToast('Thank you for your feedback!', 'success');
        router.back();
    };

    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'Send Feedback', headerShown: true }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.hero}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>We Value Your Feedback</Text>
                        <Text style={styles.subtitle}>Help us improve GetNotes for everyone.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Feedback Type</Text>
                        <View style={styles.typeRow}>
                            {FEEDBACK_TYPES.map((t) => {
                                const active = type === t.key;
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        style={[styles.typeChip, active && styles.typeChipActive]}
                                        onPress={() => setType(t.key)}
                                        activeOpacity={0.8}
                                        accessibilityRole="button"
                                        accessibilityLabel={t.label}
                                        accessibilityState={{ selected: active }}
                                    >
                                        <Ionicons
                                            name={t.icon as any}
                                            size={16}
                                            color={active ? colors.textOnPrimary : colors.primary}
                                        />
                                        <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.label, { marginTop: spacing.lg }]}>Your Message</Text>
                        <TextInput
                            style={styles.textArea}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Describe your feedback, suggestion, or issue in detail..."
                            placeholderTextColor={colors.textLight}
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={[styles.label, { marginTop: spacing.lg }]}>Email (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            placeholderTextColor={colors.textLight}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={{ marginTop: spacing.xl }}>
                            <Button
                                title={isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                icon="send-outline"
                                fullWidth
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeChipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    typeChipTextActive: { color: colors.textOnPrimary },
    textArea: {
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
        minHeight: 140,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
});
