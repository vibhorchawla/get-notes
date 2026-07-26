import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import Button from '../../components/Button';

const CONTACT_EMAIL = process.env.EXPO_PUBLIC_CONTACT_EMAIL || 'support@getnotes.app';
const WEBSITE_URL = process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://www.getnotes.app';
const TWITTER_URL = process.env.EXPO_PUBLIC_TWITTER_URL || 'https://twitter.com/getnotesapp';
const INSTAGRAM_URL = process.env.EXPO_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/getnotesapp';

const CONTACT_ITEMS = [
    { icon: 'mail-outline' as const, label: 'Email', value: CONTACT_EMAIL, action: `mailto:${CONTACT_EMAIL}` },
    { icon: 'globe-outline' as const, label: 'Website', value: WEBSITE_URL.replace(/^https?:\/\//, ''), action: WEBSITE_URL },
    { icon: 'logo-twitter' as const, label: 'Twitter', value: '@getnotesapp', action: TWITTER_URL },
    { icon: 'logo-instagram' as const, label: 'Instagram', value: '@getnotesapp', action: INSTAGRAM_URL },
];

export default function ContactScreen() {
    const handleOpen = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'Contact Us', headerShown: true }} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.iconWrap}>
                        <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Get in Touch</Text>
                    <Text style={styles.subtitle}>
                        We'd love to hear from you. Reach out through any channel below.
                    </Text>
                </View>

                <View style={styles.card}>
                    {CONTACT_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.contactRow, i < CONTACT_ITEMS.length - 1 && styles.contactBorder]}
                            onPress={() => handleOpen(item.action)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`Contact via ${item.label}`}
                        >
                            <View style={styles.contactIcon}>
                                <Ionicons name={item.icon} size={22} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={styles.contactLabel}>{item.label}</Text>
                                <Text style={styles.contactValue}>{item.value}</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textLight} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Response Time</Text>
                    <Text style={styles.cardBody}>
                        We typically respond within 24 hours during business days. For urgent issues,
                        please reach out via email with "URGENT" in the subject line.
                    </Text>
                </View>

                <Button
                    title="Send us an email"
                    onPress={() => handleOpen(`mailto:${CONTACT_EMAIL}`)}
                    icon="mail-outline"
                    fullWidth
                />
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
        backgroundColor: 'rgba(91, 127, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        lineHeight: 22,
        maxWidth: 300,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    contactBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    contactIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(91, 127, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    contactText: { flex: 1 },
    contactLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
    cardTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    cardBody: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});
