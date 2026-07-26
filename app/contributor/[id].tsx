import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Linking,
    FlatList,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';
import { apiFetch } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import GradientBackground from '../../components/GradientBackground';
import SearchNoteCard from '../../components/SearchNoteCard';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { Note } from '../../types/note';

type Tab = 'overview' | 'notes' | 'achievements' | 'activity';
type NoteSort = 'newest' | 'popular' | 'rating' | 'views' | 'subject' | 'course';

interface ContributorProfile {
    user: {
        id: string;
        name: string;
        email: string;
        course: string;
        branch: string;
        college: string;
        currentSemester: number;
        graduationYear: number;
        avatar: string;
        bio: string;
        socialLinks: { linkedin: string; github: string; portfolio: string };
        isVerifiedContributor: boolean;
        createdAt: string;
    };
    reputation: {
        points: number;
        rank: number;
        totalUploads: number;
        totalDownloads: number;
        totalViews: number;
        totalLikes: number;
        averageRating: number;
        currentBadge: { name: string; minPoints: number };
        badges: Array<{ name: string; earnedAt: string }>;
    };
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        earned: boolean;
        earnedAt: string | null;
    }>;
    followerCount: number;
    followingCount: number;
}

interface ActivityItem {
    type: string;
    noteId: string;
    noteTitle: string;
    value?: any;
    timestamp: string;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
    const sv = useSharedValue(0);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        sv.value = withTiming(value, { duration }, (finished) => {
            if (finished) setDisplay(value);
        });
    }, [value]);

    const animStyle = useAnimatedStyle(() => {
        const rounded = Math.round(sv.value);
        if (rounded !== display) {
            setDisplay(rounded);
        }
        return {};
    });

    return <Animated.View style={animStyle}><Text>{display.toLocaleString()}</Text></Animated.View>;
}

export default function ContributorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<ContributorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [notes, setNotes] = useState<Note[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [notesPage, setNotesPage] = useState(1);
    const [notesTotal, setNotesTotal] = useState(0);
    const [noteSort, setNoteSort] = useState<NoteSort>('newest');
    const [noteSearch, setNoteSearch] = useState('');
    const [activity, setActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const res = await apiFetch<ContributorProfile>(`/contributor/${id}/profile`, { requiresAuth: false });
                if (!cancelled && res.success && res.data) {
                    setProfile(res.data);
                }
            } catch (e) {
                if (!cancelled) console.error('Load contributor error:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    const loadNotes = useCallback(async (sort: NoteSort, page: number, search: string) => {
        setNotesLoading(true);
        try {
            const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
            const res = await apiFetch<Note[]>(`/contributor/${id}/notes?sort=${sort}&page=${page}&limit=20${searchParam}`, { requiresAuth: false });
            if (res.success && res.data) {
                if (page === 1) {
                    setNotes(res.data);
                } else {
                    setNotes(prev => [...prev, ...res.data!]);
                }
                const pagination = (res as any).pagination;
                if (pagination) setNotesTotal(pagination.total);
            }
        } catch (e) {
            console.error('Load notes error:', e);
        } finally {
            setNotesLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === 'notes') {
            loadNotes(noteSort, 1, noteSearch);
            setNotesPage(1);
        }
    }, [activeTab, noteSort]);

    useEffect(() => {
        if (activeTab === 'activity' && activity.length === 0) {
            apiFetch<ActivityItem[]>(`/contributor/${id}/activity`, { requiresAuth: false })
                .then(res => { if (res.success && res.data) setActivity(res.data); })
                .catch(() => {});
        }
    }, [activeTab, id]);

    const isOwnProfile = currentUser?.id === id;

    if (loading) {
        return (
            <GradientBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </GradientBackground>
        );
    }

    if (!profile) {
        return (
            <GradientBackground>
                <Stack.Screen options={{ title: 'Contributor', headerShown: true }} />
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-outline" size={48} color={colors.textLight} />
                    <Text style={styles.errorText}>Contributor not found</Text>
                </View>
            </GradientBackground>
        );
    }

    const { user, reputation, achievements, followerCount, followingCount } = profile;
    const badges = [
        { name: '🌱 New Contributor', minPoints: 0, emoji: '🌱' },
        { name: '🥉 Bronze Contributor', minPoints: 50, emoji: '🥉' },
        { name: '🥈 Silver Contributor', minPoints: 200, emoji: '🥈' },
        { name: '🥇 Gold Contributor', minPoints: 500, emoji: '🥇' },
        { name: '💎 Platinum Contributor', minPoints: 1000, emoji: '💎' },
        { name: '👑 Top Contributor', minPoints: 2000, emoji: '👑' },
    ];

    const statCards = [
        { icon: 'book-outline', label: 'Notes', value: reputation.totalUploads, color: colors.primary },
        { icon: 'download-outline', label: 'Downloads', value: reputation.totalDownloads, color: colors.accent },
        { icon: 'eye-outline', label: 'Views', value: reputation.totalViews, color: colors.info },
        { icon: 'heart-outline', label: 'Likes', value: reputation.totalLikes, color: '#EF4444' },
        { icon: 'star', label: 'Avg Rating', value: reputation.averageRating, color: '#FFC107', isDecimal: true },
        { icon: 'trophy-outline', label: 'Points', value: reputation.points, color: '#F59E0B' },
        { icon: 'globe-outline', label: 'Rank', value: reputation.rank, color: colors.secondary },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'upload': return { name: 'cloud-upload-outline', color: colors.primary };
            case 'download': return { name: 'download-outline', color: colors.accent };
            case 'like': return { name: 'heart-outline', color: '#EF4444' };
            case 'rating': return { name: 'star', color: '#FFC107' };
            case 'verified': return { name: 'checkmark-circle', color: colors.accent };
            default: return { name: 'ellipse-outline', color: colors.textLight };
        }
    };

    const getActivityText = (item: ActivityItem) => {
        switch (item.type) {
            case 'upload': return `Uploaded "${item.noteTitle}"`;
            case 'download': return `"${item.noteTitle}" was downloaded`;
            case 'like': return `"${item.noteTitle}" received a like`;
            case 'rating': return `"${item.noteTitle}" was rated ${item.value}★`;
            case 'verified': return `"${item.noteTitle}" was verified`;
            default: return 'Activity';
        }
    };

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: user.name,
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: typography.fontWeight.bold },
                }}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100).springify().damping(14)} style={styles.headerCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarLargeText}>{user.name.charAt(0).toUpperCase()}</Text>
                            {user.isVerifiedContributor && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                </View>
                            )}
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            {user.college ? <Text style={styles.userCollege}>{user.college}</Text> : null}
                            <View style={styles.headerMeta}>
                                {user.course ? (
                                    <View style={styles.metaChip}>
                                        <Ionicons name="school-outline" size={12} color={colors.primary} />
                                        <Text style={styles.metaChipText}>{user.course}</Text>
                                    </View>
                                ) : null}
                                {user.branch ? (
                                    <View style={styles.metaChip}>
                                        <Ionicons name="git-branch-outline" size={12} color={colors.primary} />
                                        <Text style={styles.metaChipText}>{user.branch}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {user.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}

                    <View style={styles.badgeRow}>
                        <View style={styles.badgeChip}>
                            <Text style={styles.badgeText}>{reputation.currentBadge.name}</Text>
                        </View>
                        {user.currentSemester ? (
                            <View style={styles.metaChip}>
                                <Text style={styles.metaChipText}>Sem {user.currentSemester}</Text>
                            </View>
                        ) : null}
                        <View style={styles.metaChip}>
                            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                            <Text style={styles.metaChipText}>Joined {formatDate(user.createdAt)}</Text>
                        </View>
                    </View>

                    {(user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.portfolio) ? (
                        <View style={styles.socialRow}>
                            {user.socialLinks.linkedin ? (
                                <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(user.socialLinks.linkedin)}>
                                    <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
                                </TouchableOpacity>
                            ) : null}
                            {user.socialLinks.github ? (
                                <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(user.socialLinks.github)}>
                                    <Ionicons name="logo-github" size={18} color={colors.textPrimary} />
                                </TouchableOpacity>
                            ) : null}
                            {user.socialLinks.portfolio ? (
                                <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(user.socialLinks.portfolio)}>
                                    <Ionicons name="globe-outline" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : null}

                    <View style={styles.followRow}>
                        <View style={styles.followStat}>
                            <Text style={styles.followNum}>{followerCount}</Text>
                            <Text style={styles.followLabel}>Followers</Text>
                        </View>
                        <View style={styles.followStat}>
                            <Text style={styles.followNum}>{followingCount}</Text>
                            <Text style={styles.followLabel}>Following</Text>
                        </View>
                        <View style={styles.followStat}>
                            <Text style={styles.followNum}>{reputation.totalUploads}</Text>
                            <Text style={styles.followLabel}>Notes</Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.tabRow}>
                    {(['overview', 'notes', 'achievements', 'activity'] as Tab[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'overview' && (
                    <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                        <Text style={styles.sectionTitle}>Reputation</Text>
                        <View style={styles.statGrid}>
                            {statCards.map((card, i) => (
                                <Animated.View
                                    key={card.label}
                                    entering={FadeInDown.delay(300 + i * 80).springify().damping(14)}
                                    style={styles.statCard}
                                >
                                    <View style={[styles.statIconWrap, { backgroundColor: `${card.color}15` }]}>
                                        <Ionicons name={card.icon as any} size={20} color={card.color} />
                                    </View>
                                    <Text style={[styles.statValue, { color: card.color }]}>
                                        {card.isDecimal ? card.value.toFixed(1) : <AnimatedCounter value={card.value} />}
                                    </Text>
                                    <Text style={styles.statLabel}>{card.label}</Text>
                                </Animated.View>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Earned Badges</Text>
                        <View style={styles.badgeGrid}>
                            {badges.map((badge, i) => {
                                const earned = reputation.points >= badge.minPoints;
                                return (
                                    <Animated.View
                                        key={badge.name}
                                        entering={FadeInDown.delay(400 + i * 80).springify().damping(14)}
                                        style={[styles.badgeCard, !earned && styles.badgeCardLocked]}
                                    >
                                        <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}>{badge.emoji}</Text>
                                        <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={1}>{badge.name.split(' ').slice(1).join(' ')}</Text>
                                        <Text style={styles.badgePoints}>{badge.minPoints} pts</Text>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {activeTab === 'notes' && (
                    <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                        <View style={styles.searchRow}>
                            <View style={styles.searchInput}>
                                <Ionicons name="search" size={16} color={colors.textLight} />
                                <TextInput
                                    style={styles.searchField}
                                    placeholder="Search notes..."
                                    placeholderTextColor={colors.textLight}
                                    value={noteSearch}
                                    onChangeText={setNoteSearch}
                                    onSubmitEditing={() => loadNotes(noteSort, 1, noteSearch)}
                                    returnKeyType="search"
                                />
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
                            {([
                                { key: 'newest', label: 'Newest' },
                                { key: 'popular', label: 'Most Downloaded' },
                                { key: 'rating', label: 'Highest Rated' },
                                { key: 'views', label: 'Most Viewed' },
                                { key: 'subject', label: 'By Subject' },
                                { key: 'course', label: 'By Course' },
                            ] as Array<{ key: NoteSort; label: string }>).map((opt) => (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[styles.sortChip, noteSort === opt.key && styles.sortChipActive]}
                                    onPress={() => { setNoteSort(opt.key); }}
                                >
                                    <Text style={[styles.sortText, noteSort === opt.key && styles.sortTextActive]}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {notes.map((note, i) => (
                            <SearchNoteCard
                                key={note.id}
                                note={note}
                                index={i}
                                onPress={() => router.push(`/note/${note.id}`)}
                                onUploaderPress={() => router.push(`/contributor/${id}`)}
                            />
                        ))}

                        {notesLoading && <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />}

                        {!notesLoading && notes.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
                                <Text style={styles.emptyText}>No notes found</Text>
                            </View>
                        )}

                        {notes.length < notesTotal && !notesLoading && (
                            <TouchableOpacity
                                style={styles.loadMoreBtn}
                                onPress={() => { const next = notesPage + 1; setNotesPage(next); loadNotes(noteSort, next, noteSearch); }}
                            >
                                <Text style={styles.loadMoreText}>Load More</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}

                {activeTab === 'achievements' && (
                    <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                        <View style={styles.achievementGrid}>
                            {achievements.map((ach, i) => (
                                <Animated.View
                                    key={ach.id}
                                    entering={FadeInDown.delay(200 + i * 80).springify().damping(14)}
                                    style={[styles.achievementCard, !ach.earned && styles.achievementLocked]}
                                >
                                    <Text style={[styles.achievementIcon, !ach.earned && styles.achievementIconLocked]}>{ach.icon}</Text>
                                    <View style={styles.achievementInfo}>
                                        <Text style={[styles.achievementName, !ach.earned && styles.achievementNameLocked]}>{ach.name}</Text>
                                        <Text style={styles.achievementDesc}>{ach.description}</Text>
                                        {ach.earned && ach.earnedAt && (
                                            <Text style={styles.achievementDate}>Earned {formatDate(ach.earnedAt)}</Text>
                                        )}
                                    </View>
                                    {ach.earned && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                    )}
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {activeTab === 'activity' && (
                    <Animated.View entering={FadeInDown.delay(200).springify().damping(14)}>
                        {activity.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={48} color={colors.textLight} />
                                <Text style={styles.emptyText}>No activity yet</Text>
                            </View>
                        ) : (
                            <View style={styles.timeline}>
                                {activity.map((item, i) => {
                                    const icon = getActivityIcon(item.type);
                                    return (
                                        <Animated.View
                                            key={`${item.type}-${item.noteId}-${i}`}
                                            entering={FadeInDown.delay(200 + i * 60).springify().damping(14)}
                                            style={styles.timelineItem}
                                        >
                                            <View style={styles.timelineDot}>
                                                <View style={[styles.timelineIcon, { backgroundColor: `${icon.color}15` }]}>
                                                    <Ionicons name={icon.name as any} size={16} color={icon.color} />
                                                </View>
                                                {i < activity.length - 1 && <View style={styles.timelineLine} />}
                                            </View>
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.timelineText}>{getActivityText(item)}</Text>
                                                <Text style={styles.timelineTime}>{formatRelativeTime(item.timestamp)}</Text>
                                                {item.noteId && (
                                                    <TouchableOpacity onPress={() => router.push(`/note/${item.noteId}`)}>
                                                        <Text style={styles.timelineLink}>View Note →</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}
                    </Animated.View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
    errorText: { fontSize: typography.fontSize.md, color: colors.textSecondary },
    headerCard: {
        backgroundColor: colors.cardBackground, margin: spacing.screenPadding, marginBottom: 0,
        borderRadius: 20, padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    },
    headerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    avatarLarge: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarLargeText: { fontSize: 28, fontWeight: typography.fontWeight.bold, color: '#FFFFFF' },
    verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFFFFF', borderRadius: 12 },
    headerInfo: { flex: 1, justifyContent: 'center' },
    userName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    userCollege: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    headerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
    metaChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(91, 127, 255, 0.08)', borderRadius: 999,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    metaChipText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.medium },
    userBio: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    badgeChip: {
        backgroundColor: 'rgba(91, 127, 255, 0.10)', borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    badgeText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold },
    socialRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    socialBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(91, 127, 255, 0.08)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    followRow: {
        flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border,
    },
    followStat: { alignItems: 'center' },
    followNum: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    followLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    tabRow: {
        flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginBottom: spacing.md,
        backgroundColor: colors.cardBackground, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border,
    },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 10, alignItems: 'center' },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textSecondary },
    tabTextActive: { color: '#FFFFFF', fontWeight: typography.fontWeight.semibold },
    sectionTitle: {
        fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary, marginHorizontal: spacing.screenPadding, marginBottom: spacing.md, marginTop: spacing.sm,
    },
    statGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
        marginHorizontal: spacing.screenPadding, marginBottom: spacing.lg,
    },
    statCard: {
        width: '47%', backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.xs,
    },
    statIconWrap: {
        width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs,
    },
    statValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
    statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
    badgeGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
        marginHorizontal: spacing.screenPadding,
    },
    badgeCard: {
        width: '30%', backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.xs,
    },
    badgeCardLocked: { opacity: 0.4 },
    badgeEmoji: { fontSize: 28 },
    badgeEmojiLocked: { opacity: 0.3 },
    badgeName: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, textAlign: 'center' },
    badgeNameLocked: { color: colors.textLight },
    badgePoints: { fontSize: 10, color: colors.textLight },
    searchRow: { marginHorizontal: spacing.screenPadding, marginBottom: spacing.sm },
    searchInput: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.cardBackground, borderRadius: 12, paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    searchField: { flex: 1, fontSize: typography.fontSize.sm, color: colors.textPrimary, padding: 0 },
    sortRow: { paddingHorizontal: spacing.screenPadding, marginBottom: spacing.md },
    sortChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
        backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs,
    },
    sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sortText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
    sortTextActive: { color: '#FFFFFF' },
    loadMoreBtn: {
        marginHorizontal: spacing.screenPadding, paddingVertical: spacing.md,
        borderRadius: 12, backgroundColor: 'rgba(91, 127, 255, 0.08)', alignItems: 'center', marginTop: spacing.sm,
    },
    loadMoreText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary },
    emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
    emptyText: { fontSize: typography.fontSize.md, color: colors.textSecondary },
    achievementGrid: { gap: spacing.sm, marginHorizontal: spacing.screenPadding },
    achievementCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md,
        borderWidth: 1, borderColor: colors.border,
    },
    achievementLocked: { opacity: 0.4 },
    achievementIcon: { fontSize: 28 },
    achievementIconLocked: { opacity: 0.3 },
    achievementInfo: { flex: 1 },
    achievementName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    achievementNameLocked: { color: colors.textLight },
    achievementDesc: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    achievementDate: { fontSize: 10, color: colors.accent, marginTop: 2 },
    timeline: { marginHorizontal: spacing.screenPadding },
    timelineItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
    timelineDot: { alignItems: 'center', width: 32 },
    timelineIcon: {
        width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    },
    timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 },
    timelineContent: { flex: 1, paddingBottom: spacing.sm },
    timelineText: { fontSize: typography.fontSize.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.medium },
    timelineTime: { fontSize: typography.fontSize.xs, color: colors.textLight, marginTop: 2 },
    timelineLink: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold, marginTop: 4 },
});
