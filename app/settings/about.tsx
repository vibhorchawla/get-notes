import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function AboutScreen() {
    return (
        <SafeAreaView style={styles.root}>
            <Stack.Screen options={{ title: 'About GetNotes', headerShown: true }} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.logoWrap}>
                        <Ionicons name="library" size={48} color={colors.textOnPrimary} />
                    </View>
                    <Text style={styles.appName}>GetNotes</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Your Academic Companion</Text>
                    <Text style={styles.body}>
                        GetNotes is a community-driven platform designed for students to share, discover, and
                        access academic notes, study materials, and curated playlists. Whether you're
                        preparing for exams or catching up on missed lectures, GetNotes connects you with
                        notes shared by fellow students from your courses and beyond.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Key Features</Text>
                    <View style={styles.featureList}>
                        {[
                            { icon: 'search-outline', text: 'Search and discover notes across courses' },
                            { icon: 'cloud-upload-outline', text: 'Upload and share your own notes with the community' },
                            { icon: 'bookmark-outline', text: 'Save notes for quick offline access' },
                            { icon: 'download-outline', text: 'Download PDFs and study offline' },
                            { icon: 'play-circle-outline', text: 'Access curated YouTube playlists' },
                            { icon: 'diamond-outline', text: 'Premium features for enhanced learning' },
                        ].map((feature, i) => (
                            <View key={i} style={styles.featureItem}>
                                <Ionicons name={feature.icon as any} size={18} color={colors.primary} />
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Built For Students</Text>
                    <Text style={styles.body}>
                        GetNotes is built by students, for students. Our mission is to make quality
                        academic materials accessible to everyone, fostering collaborative learning
                        across institutions and disciplines.
                    </Text>
                </View>

                <Text style={styles.footer}>© 2026 GetNotes. All rights reserved.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    hero: { alignItems: 'center', paddingVertical: spacing.xl },
    logoWrap: {
        width: 96,
        height: 96,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 6,
    },
    appName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    version: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
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
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    body: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    featureList: { gap: spacing.md },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    featureText: {
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        flex: 1,
    },
    footer: {
        textAlign: 'center',
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginTop: spacing.lg,
    },
});
