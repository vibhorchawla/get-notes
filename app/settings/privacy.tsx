import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const SECTIONS = [
    {
        title: 'Information We Collect',
        content: 'We collect information you provide directly, such as your name, email address, and course details when you create an account. We also collect usage data including notes viewed, saved, and downloaded to improve our service.'
    },
    {
        title: 'How We Use Your Information',
        content: 'Your information is used to provide and improve GetNotes, personalize your experience, communicate with you about updates, and enable community features like sharing notes with other students.'
    },
    {
        title: 'Information Sharing',
        content: 'We do not sell your personal information. Notes you choose to share are visible to other students. Your email and personal details are never publicly displayed without your consent.'
    },
    {
        title: 'Data Security',
        content: 'We implement industry-standard security measures to protect your data. All communications are encrypted using HTTPS. Your authentication tokens are stored securely on your device.'
    },
    {
        title: 'Your Rights',
        content: 'You can access, update, or delete your account information at any time through your profile settings. Contact us if you need assistance with data deletion.'
    },
    {
        title: 'Cookies',
        content: 'We use essential cookies and similar technologies to maintain your session and provide core functionality. We do not use tracking cookies for advertising purposes.'
    },
];

export default function PrivacyScreen() {
    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true }} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last updated: July 2026</Text>

                {SECTIONS.map((section, i) => (
                    <View key={i} style={styles.card}>
                        <Text style={styles.heading}>{section.title}</Text>
                        <Text style={styles.body}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.card}>
                    <Text style={styles.heading}>Contact</Text>
                    <Text style={styles.body}>
                        For privacy-related inquiries, contact us at {process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'support@getnotes.app'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    lastUpdated: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    heading: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    body: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});
