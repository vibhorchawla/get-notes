import { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import TopHeader from '../../components/TopHeader';
import ProfileAvatar from '../../components/ProfileAvatar';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useUserStats } from '../../hooks/useUserStats';
import { useToast } from '../../context/ToastContext';
import { useReputation } from '../../hooks/useReputation';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const StatCard = ({ icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) => (
    <View style={styles.statCard}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const BadgeCard = ({ name, earned }: { name: string; earned?: string }) => {
    const colors_map: Record<string, string> = {
        '🌟': '#FFC107',
        '📘': '#3B82F6',
        '🏆': '#F59E0B',
        '👑': '#8B5CF6',
    };
    const emoji = name.split(' ')[0] || '🌟';
    return (
        <View style={[styles.badgeCard, { borderColor: colors_map[emoji] || colors.border }]}>
            <Text style={styles.badgeEmoji}>{emoji}</Text>
            <Text style={styles.badgeName}>{name.replace(emoji, '').trim()}</Text>
            {earned ? <Text style={styles.badgeDate}>{formatDate(earned)}</Text> : null}
        </View>
    );
};

export default function ProfileScreen() {
    const { user } = useAuth();
    const { stats, isLoading: statsLoading, refetch: refetchStats } = useUserStats();
    const { reputation, isLoading: repLoading } = useReputation();
    const { showToast } = useToast();
    const router = useRouter();

    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCourse, setEditCourse] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchStats();
        setRefreshing(false);
    }, [refetchStats]);

    const now = new Date();
    const isPremium = user?.isPremium ?? false;
    const premiumEnd = user?.premiumEndDate ? new Date(user.premiumEndDate) : null;
    const isExpired = premiumEnd ? premiumEnd < now : false;
    const premiumActive = isPremium && !isExpired;

    const isLoading = !user;
    const badgeName = stats.badge || reputation?.currentBadge?.name || '🌟 Beginner';
    const totalPts = stats.reputationPoints || reputation?.points || 0;
    const userRank = stats.rank || reputation?.rank || 0;

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

    const handleEditCancel = () => setEditing(false);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="My Profile" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <View style={styles.content}>
                        {isLoading ? (
                            <LoadingSkeleton.ProfileHeader />
                        ) : editing ? (
                            <View style={styles.profileHeader}>
                                <ProfileAvatar size={120} editable />
                                <View style={styles.editForm}>
                                    <Text style={styles.fieldLabel}>Name</Text>
                                    <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={colors.textLight} />
                                    <Text style={styles.fieldLabel}>Course</Text>
                                    <TextInput style={styles.editInput} value={editCourse} onChangeText={setEditCourse} placeholder="e.g. B.Tech CSE" placeholderTextColor={colors.textLight} />
                                    <View style={styles.editActions}>
                                        <Button title="Save" onPress={handleEditSave} size="sm" />
                                        <Button title="Cancel" onPress={handleEditCancel} variant="secondary" size="sm" />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.profileHeader}>
                                <ProfileAvatar size={100} editable />
                                <Text style={styles.name}>{user?.name || 'User'}</Text>
                                <Text style={styles.email}>{user?.email || ''}</Text>
                                <View style={styles.badgeRow}>
                                    <Text style={styles.badgeLabel}>{badgeName}</Text>
                                    <Text style={styles.pointsLabel}>{totalPts} pts</Text>
                                    {userRank > 0 && <Text style={styles.rankLabel}>#{userRank}</Text>}
                                </View>
                                <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditStart} activeOpacity={0.8}>
                                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                                    <Text style={styles.editProfileText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isLoading && (
                            <TouchableOpacity style={styles.premiumCard} onPress={() => router.push('/(drawer)/subscription')} activeOpacity={0.8}>
                                <View style={styles.premiumRow}>
                                    <Ionicons name={premiumActive ? 'diamond' : 'diamond-outline'} size={24} color={premiumActive ? '#10B981' : colors.primary} />
                                    <View style={styles.premiumTextWrap}>
                                        <Text style={styles.premiumTitle}>{premiumActive ? 'Premium Member' : 'Get Premium'}</Text>
                                        {premiumActive ? (
                                            <>
                                                <Text style={styles.premiumSub}>Plan: {user?.premiumPlan ? user.premiumPlan.charAt(0).toUpperCase() + user.premiumPlan.slice(1) : ''}</Text>
                                                <Text style={styles.premiumSub}>Expires: {formatDate(user?.premiumEndDate)}</Text>
                                            </>
                                        ) : (
                                            <Text style={styles.premiumSub}>Unlock unlimited notes & AI summaries</Text>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                                </View>
                            </TouchableOpacity>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contribution Stats</Text>
                            {statsLoading || repLoading ? (
                                <View style={styles.statsGrid}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <View key={i} style={styles.statCard}>
                                            <LoadingSkeleton.Block width={24} height={24} borderRadius={12} />
                                            <View style={{ height: 8 }} />
                                            <LoadingSkeleton.Block width={30} height={20} borderRadius={4} />
                                            <View style={{ height: 4 }} />
                                            <LoadingSkeleton.Block width={40} height={10} borderRadius={4} />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.statsGrid}>
                                    <StatCard icon="cloud-upload" value={stats.totalUploads} label="Uploads" color={colors.primary} />
                                    <StatCard icon="download" value={stats.downloadsReceived} label="Downloads" color={colors.accent} />
                                    <StatCard icon="eye" value={stats.totalViews} label="Views" color={colors.secondary} />
                                    <StatCard icon="heart" value={stats.totalLikes} label="Likes" color="#EF4444" />
                                </View>
                            )}
                        </View>

                        {reputation?.badges && reputation.badges.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Achievements</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
                                    {reputation.badges.map((b, i) => (
                                        <BadgeCard key={i} name={b.name} earned={b.earnedAt} />
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Statistics</Text>
                            <View style={styles.statsGrid}>
                                <StatCard icon="bookmark" value={stats.saved} label="Saved" color="#3B82F6" />
                                <StatCard icon="download-outline" value={stats.downloads} label="Downloaded" color="#8B5CF6" />
                                <StatCard icon="star" value={stats.averageRating.toFixed(1)} label="Avg Rating" color="#FFC107" />
                                <StatCard icon="trophy" value={`#${stats.rank || '-'}`} label="Rank" color="#F59E0B" />
                            </View>
                        </View>

                        <View style={styles.quickLinks}>
                            <QuickLink icon="document-text-outline" label="My Uploads" onPress={() => router.push('/(drawer)/notes')} />
                            <QuickLink icon="bookmark-outline" label="Saved" onPress={() => router.push('/(drawer)/saved')} />
                            <QuickLink icon="download-outline" label="Downloads" onPress={() => router.push('/(drawer)/downloads')} />
                            <QuickLink icon="compass-outline" label="Explore" onPress={() => router.push('/community')} />
                        </View>

                        <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
                            const { useAuth } = await import('../../context/AuthContext');
                        }}>
                            <Text style={styles.logoutBtnText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

function QuickLink({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={22} color={colors.primary} />
            <Text style={styles.quickLinkLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.screenPadding },
    profileHeader: {
        alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md,
        marginBottom: spacing.sm, backgroundColor: colors.cardBackground, borderRadius: 24,
        borderWidth: 1, borderColor: colors.border,
    },
    name: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs },
    email: { fontSize: typography.fontSize.md, color: colors.textSecondary },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
    badgeLabel: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.bold, backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    pointsLabel: { fontSize: typography.fontSize.sm, color: colors.accent, fontWeight: typography.fontWeight.bold, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    rankLabel: { fontSize: typography.fontSize.sm, color: '#F59E0B', fontWeight: typography.fontWeight.bold, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
    editProfileText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary },
    editForm: { width: '100%', marginTop: spacing.md },
    fieldLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs, alignSelf: 'flex-start' },
    editInput: { width: '100%', backgroundColor: colors.background, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 12, color: colors.textPrimary, fontSize: typography.fontSize.md },
    editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    premiumCard: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
    premiumRow: { flexDirection: 'row', alignItems: 'center' },
    premiumTextWrap: { flex: 1, marginLeft: spacing.md },
    premiumTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    premiumSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    section: { marginBottom: spacing.xl },
    sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md },
    statsGrid: { flexDirection: 'row', gap: spacing.sm },
    statCard: {
        flex: 1, backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    statValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.sm },
    statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
    badgesScroll: { gap: spacing.sm },
    badgeCard: {
        backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        alignItems: 'center', borderWidth: 1, minWidth: 100,
    },
    badgeEmoji: { fontSize: 28 },
    badgeName: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginTop: 4, textAlign: 'center' },
    badgeDate: { fontSize: 9, color: colors.textLight, marginTop: 2 },
    quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
    quickLink: {
        width: '48%', backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    quickLinkLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary },
    logoutBtn: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: 40 },
    logoutBtnText: { fontSize: typography.fontSize.md, color: colors.textSecondary },
});
