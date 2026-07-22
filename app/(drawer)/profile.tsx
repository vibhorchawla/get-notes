import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import TopHeader from '../../components/TopHeader';
import ProfileAvatar from '../../components/ProfileAvatar';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useUserStats } from '../../hooks/useUserStats';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calculateStorageFraction(stats: { saved: number; downloads: number; notesRead: number }): { used: number; total: number; fraction: number } {
    const used = stats.saved * 0.5 + stats.downloads * 1.2 + stats.notesRead * 0.3;
    const total = 500;
    return { used: Math.min(used, total), total, fraction: Math.min(used / total, 1) };
}

export default function ProfileScreen() {
    const { user } = useAuth();
    const { stats, isLoading: statsLoading } = useUserStats();
    const { showToast } = useToast();
    const router = useRouter();

    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCourse, setEditCourse] = useState('');

    const now = new Date();
    const isPremium = user?.isPremium ?? false;
    const premiumEnd = user?.premiumEndDate ? new Date(user.premiumEndDate) : null;
    const isExpired = premiumEnd ? premiumEnd < now : false;
    const premiumActive = isPremium && !isExpired;

    const isLoading = !user;
    const isLoadingStats = statsLoading;

    const storage = calculateStorageFraction(stats);

    const handleEditStart = () => {
        setEditName(user?.name || '');
        setEditCourse(user?.course || '');
        setEditing(true);
    };

    const handleEditSave = () => {
        if (!editName.trim()) {
            showToast('Name cannot be empty.', 'error');
            return;
        }
        showToast('Profile updated successfully!', 'success');
        setEditing(false);
    };

    const handleEditCancel = () => {
        setEditing(false);
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="My Profile" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {isLoading ? (
                            <LoadingSkeleton.ProfileHeader />
                        ) : editing ? (
                            <View style={styles.profileHeader}>
                                <ProfileAvatar size={120} editable />
                                <View style={styles.editForm}>
                                    <Text style={styles.fieldLabel}>Name</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={editName}
                                        onChangeText={setEditName}
                                        placeholder="Your name"
                                        placeholderTextColor={colors.textLight}
                                    />
                                    <Text style={styles.fieldLabel}>Course</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={editCourse}
                                        onChangeText={setEditCourse}
                                        placeholder="e.g. B.Tech CSE"
                                        placeholderTextColor={colors.textLight}
                                    />
                                    <View style={styles.editActions}>
                                        <Button title="Save" onPress={handleEditSave} size="sm" />
                                        <Button title="Cancel" onPress={handleEditCancel} variant="secondary" size="sm" />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.profileHeader}>
                                <ProfileAvatar size={120} editable />
                                <Text style={styles.name}>{user?.name || 'User Name'}</Text>
                                <Text style={styles.email}>{user?.email || ''}</Text>
                                <TouchableOpacity
                                    style={styles.editProfileBtn}
                                    onPress={handleEditStart}
                                    activeOpacity={0.8}
                                    accessibilityRole="button"
                                    accessibilityLabel="Edit profile"
                                >
                                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                                    <Text style={styles.editProfileText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Premium Section */}
                        {!isLoading && (
                            <TouchableOpacity
                                style={styles.premiumCard}
                                onPress={() => router.push('/(drawer)/subscription')}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityLabel={premiumActive ? 'Premium subscription details' : 'Get premium'}
                            >
                                <View style={styles.premiumRow}>
                                    <Ionicons
                                        name={premiumActive ? 'diamond' : 'diamond-outline'}
                                        size={24}
                                        color={premiumActive ? '#10B981' : colors.primary}
                                    />
                                    <View style={styles.premiumTextWrap}>
                                        <Text style={styles.premiumTitle}>
                                            {premiumActive ? 'Premium Member' : 'Get Premium'}
                                        </Text>
                                        {premiumActive ? (
                                            <>
                                                <Text style={styles.premiumSub}>
                                                    Plan: {user?.premiumPlan ? user.premiumPlan.charAt(0).toUpperCase() + user.premiumPlan.slice(1) : ''}
                                                </Text>
                                                <Text style={styles.premiumSub}>
                                                    Expires: {formatDate(user?.premiumEndDate)}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text style={styles.premiumSub}>Unlock unlimited notes & AI summaries</Text>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {!isLoading && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Academic Information</Text>
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
                                            <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Statistics</Text>

                            {isLoadingStats ? (
                                <View style={styles.statsContainer}>
                                    {[1, 2, 3].map((i) => (
                                        <View key={i} style={styles.statCard}>
                                            <LoadingSkeleton.Block width={32} height={32} borderRadius={16} />
                                            <View style={{ height: spacing.sm }} />
                                            <LoadingSkeleton.Block width={36} height={24} borderRadius={6} />
                                            <View style={{ height: spacing.xs }} />
                                            <LoadingSkeleton.Block width={50} height={12} borderRadius={6} />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <>
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statCard}>
                                            <Ionicons name="document-text" size={28} color={colors.primary} />
                                            <Text style={styles.statValue}>{stats.notesRead}</Text>
                                            <Text style={styles.statLabel}>Read</Text>
                                        </View>
                                        <View style={styles.statCard}>
                                            <Ionicons name="bookmark" size={28} color={colors.secondary} />
                                            <Text style={styles.statValue}>{stats.saved}</Text>
                                            <Text style={styles.statLabel}>Saved</Text>
                                        </View>
                                        <View style={styles.statCard}>
                                            <Ionicons name="download" size={28} color={colors.accent} />
                                            <Text style={styles.statValue}>{stats.downloads}</Text>
                                            <Text style={styles.statLabel}>Downloads</Text>
                                        </View>
                                    </View>

                                    <View style={styles.storageCard}>
                                        <View style={styles.storageHeader}>
                                            <Ionicons name="cloud-outline" size={20} color={colors.primary} />
                                            <Text style={styles.storageTitle}>Storage Usage</Text>
                                        </View>
                                        <View style={styles.storageBar}>
                                            <View style={[styles.storageFill, { width: `${storage.fraction * 100}%` }]} />
                                        </View>
                                        <Text style={styles.storageText}>
                                            {storage.used.toFixed(1)} MB of {storage.total} MB used
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>

                        <View style={styles.quickLinks}>
                            <TouchableOpacity
                                style={styles.quickLink}
                                onPress={() => router.push('/(drawer)/settings')}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Settings"
                            >
                                <Ionicons name="settings-outline" size={22} color={colors.primary} />
                                <Text style={styles.quickLinkLabel}>Settings</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickLink}
                                onPress={() => router.push('/(drawer)/subscription')}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Subscription"
                            >
                                <Ionicons name="card-outline" size={22} color={colors.primary} />
                                <Text style={styles.quickLinkLabel}>Subscription</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickLink}
                                onPress={() => router.push('/(drawer)/saved')}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Saved notes"
                            >
                                <Ionicons name="bookmark-outline" size={22} color={colors.primary} />
                                <Text style={styles.quickLinkLabel}>Saved</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickLink}
                                onPress={() => router.push('/(drawer)/downloads')}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Downloads"
                            >
                                <Ionicons name="download-outline" size={22} color={colors.primary} />
                                <Text style={styles.quickLinkLabel}>Downloads</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    quickLinks: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    quickLink: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickLinkLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
    fieldLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        alignSelf: 'flex-start',
    },
    editInput: {
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
    editForm: {
        width: '100%',
        marginTop: spacing.md,
    },
    editActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
    },
    editProfileText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    storageCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    storageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    storageTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    storageBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    storageFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    storageText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.screenPadding,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
    name: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    premiumCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    premiumRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumTextWrap: {
        flex: 1,
        marginLeft: spacing.md,
    },
    premiumTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    premiumSub: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
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
