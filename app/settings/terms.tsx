import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const SECTIONS = [
    {
        title: 'Acceptance of Terms',
        content: 'By using GetNotes, you agree to these terms. If you do not agree, please do not use the application.'
    },
    {
        title: 'User Accounts',
        content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.'
    },
    {
        title: 'Content Guidelines',
        content: 'You may only upload content that you have the right to share. Do not upload copyrighted materials without permission. Respect intellectual property rights of others.'
    },
    {
        title: 'Community Conduct',
        content: 'Be respectful to other users. Do not spam, harass, or post inappropriate content. We reserve the right to remove content and suspend accounts that violate these guidelines.'
    },
    {
        title: 'Service Availability',
        content: 'We strive to maintain high availability but do not guarantee uninterrupted service. We may update or modify the service with reasonable notice.'
    },
    {
        title: 'Limitation of Liability',
        content: 'GetNotes is provided "as is" without warranties. We are not liable for any damages arising from your use of the application.'
    },
];

export default function TermsScreen() {
    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'Terms & Conditions', headerShown: true }} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {SECTIONS.map((section, i) => (
                    <View key={i} style={styles.card}>
                        <Text style={styles.heading}>{section.title}</Text>
                        <Text style={styles.body}>{section.content}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
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
