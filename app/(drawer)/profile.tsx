import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function ProfileScreen() {
    const { user } = useAuth();

    return (
        <GradientBackground>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={60} color={colors.primary} />
                        </View>
                        <Text style={styles.name}>{user?.name || 'User Name'}</Text>
                        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                    </View>

                    {/* Profile Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="school-outline" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Course</Text>
                                    <Text style={styles.infoValue}>{user?.course || 'Not Set'}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{user?.email || 'Not Set'}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Member Since</Text>
                                    <Text style={styles.infoValue}>January 2026</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Statistics</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Ionicons name="document-text" size={32} color={colors.primary} />
                                <Text style={styles.statValue}>24</Text>
                                <Text style={styles.statLabel}>Notes Read</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="bookmark" size={32} color={colors.secondary} />
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Saved</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="download" size={32} color={colors.accent} />
                                <Text style={styles.statValue}>8</Text>
                                <Text style={styles.statLabel}>Downloads</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.screenPadding,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    name: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoContent: {
        marginLeft: spacing.md,
        flex: 1,
    },
    infoLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    infoValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.sm,
    },
    statLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
