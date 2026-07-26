import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import SearchBar from '../../components/SearchBar';
import { useCommunity, useCommunityNotes } from '../../hooks/useCommunity';
import { useNoteSearch } from '../../hooks/useNoteSearch';
import SearchNoteCard from '../../components/SearchNoteCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { openNote } from '../../utils/openNote';
import { Note } from '../../types/note';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useCourses } from '../../hooks/useCourses';

type CommunityTab = 'trending' | 'newest' | 'top-rated' | 'verified' | 'previous-year' | 'assignment' | 'lab-manual' | 'question-bank';

const PRIMARY_TABS: Array<{ key: CommunityTab; label: string; icon: string }> = [
    { key: 'trending', label: 'Trending', icon: 'flame' },
    { key: 'newest', label: 'Newest', icon: 'time' },
    { key: 'top-rated', label: 'Top Rated', icon: 'star' },
    { key: 'verified', label: 'Verified', icon: 'checkmark-circle' },
];

const SECONDARY_TABS: Array<{ key: CommunityTab; label: string; icon: string }> = [
    { key: 'previous-year', label: 'Prev Year', icon: 'calendar' },
    { key: 'assignment', label: 'Assignments', icon: 'clipboard' },
    { key: 'lab-manual', label: 'Lab Manuals', icon: 'flask' },
    { key: 'question-bank', label: 'Question Banks', icon: 'help-circle' },
];

export default function CommunityScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<CommunityTab>('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');
    const { data, isLoading, refetch } = useCommunity();
    const { courses } = useCourses();
    const { response: tabData, isLoading: tabLoading, error: tabError } = useCommunityNotes(activeTab, sortBy);
    const { results: searchResults, isSearching } = useNoteSearch(searchQuery);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleSearch = (text: string) => setSearchQuery(text);

    const currentNotes = activeTab === 'trending' ? data?.trending
        : activeTab === 'top-rated' ? data?.topRated
        : activeTab === 'newest' ? data?.recent
        : activeTab === 'verified' ? data?.verified
        : tabData?.notes || [];

    const groupedByCourse = useMemo(() => {
        const allNotes = data?.trending || [];
        const map = new Map<string, Map<number, Note[]>>();
        for (const note of allNotes) {
            if (!note.course) continue;
            if (!map.has(note.course)) map.set(note.course, new Map());
            const semMap = map.get(note.course)!;
            const sem = note.semester || 0;
            if (!semMap.has(sem)) semMap.set(sem, []);
            semMap.get(sem)!.push(note);
        }
        return map;
    }, [data?.trending]);

    const SORT_OPTIONS: Array<{ key: typeof sortBy; label: string }> = [
        { key: 'newest', label: 'Newest' },
        { key: 'popular', label: 'Most Popular' },
        { key: 'rating', label: 'Highest Rated' },
    ];

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: 'Explore',
                    headerStyle: { backgroundColor: colors.gradientStart },
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                }}
            />
            <SafeAreaView style={styles.container}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder="Search the community..."
                    />
                </View>

                {!searchQuery.trim() ? (
                    <>
                        {courses.length > 0 && (
                            <View style={styles.coursesWrap}>
                                <Text style={styles.coursesLabel}>Explore by Course</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coursesScroll}>
                                    {courses.map((course) => (
                                        <TouchableOpacity
                                            key={course.id}
                                            style={styles.courseCard}
                                            onPress={() => router.push(`/course/${course.id}`)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name={(course.icon as any) || 'school-outline'} size={20} color={colors.primary} />
                                            <Text style={styles.courseCardName} numberOfLines={1}>{course.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.primaryTabsRow}>
                            {PRIMARY_TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[styles.primaryTab, isActive && styles.primaryTabActive]}
                                        onPress={() => setActiveTab(tab.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={tab.icon as any}
                                            size={15}
                                            color={isActive ? colors.textOnPrimary : colors.textSecondary}
                                        />
                                        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.tabsScroll}
                            contentContainerStyle={styles.tabsContent}
                        >
                            {SECONDARY_TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[styles.tab, isActive && styles.tabActive]}
                                        onPress={() => setActiveTab(tab.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={tab.icon as any}
                                            size={15}
                                            color={isActive ? colors.textOnPrimary : colors.textSecondary}
                                        />
                                        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {activeTab !== 'trending' && activeTab !== 'newest' && activeTab !== 'top-rated' && activeTab !== 'verified' && (
                            <View style={styles.sortRow}>
                                {SORT_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
                                        onPress={() => setSortBy(opt.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                        >
                            <View style={styles.content}>
                                {activeTab === 'trending' && groupedByCourse.size > 0 ? (
                                    <>
                                        {Array.from(groupedByCourse.entries()).map(([course, semMap]) => (
                                            <View key={course} style={styles.courseSection}>
                                                <View style={styles.courseHeader}>
                                                    <Ionicons name="school-outline" size={18} color={colors.primary} />
                                                    <Text style={styles.courseTitle}>{course}</Text>
                                                </View>
                                                {Array.from(semMap.entries()).map(([sem, notes]) => (
                                                    <View key={`${course}-${sem}`} style={styles.semesterSection}>
                                                        <Text style={styles.semesterTitle}>Semester {sem}</Text>
                                                        {notes.map((note, idx) => (
                                                            <SearchNoteCard
                                                                key={note.id}
                                                                note={note}
                                                                index={idx}
                                                                onPress={() => openNote(router, note)}
                                                                onUploaderPress={() => (note.uploaderId || note.uploadedBy?.id) ? router.push(`/contributor/${note.uploaderId || note.uploadedBy?.id}`) : undefined}
                                                            />
                                                        ))}
                                                    </View>
                                                ))}
                                            </View>
                                        ))}
                                    </>
                                ) : tabError ? (
                                    <EmptyState icon="alert-circle-outline" title="Something went wrong" message={tabError} />
                                ) : isLoading || tabLoading ? (
                                    <View style={styles.skeletonWrap}>
                                        <LoadingSkeleton.Card lines={2} />
                                        <LoadingSkeleton.Card lines={2} />
                                        <LoadingSkeleton.Card lines={2} />
                                    </View>
                                ) : currentNotes && currentNotes.length > 0 ? (
                                    currentNotes.map((note, idx) => (
                                        <SearchNoteCard
                                            key={note.id}
                                            note={note}
                                            index={idx}
                                            onPress={() => openNote(router, note)}
                                            onUploaderPress={() => (note.uploaderId || note.uploadedBy?.id) ? router.push(`/contributor/${note.uploaderId || note.uploadedBy?.id}`) : undefined}
                                        />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon="globe-outline"
                                        title="No notes yet"
                                        message="Be the first to upload notes for this topic!"
                                        actionLabel="Upload Note"
                                        onAction={() => router.push('/upload-note')}
                                    />
                                )}
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            {isSearching ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                            ) : searchResults.length > 0 ? (
                                searchResults.map((note, idx) => (
                                    <SearchNoteCard
                                        key={note.id}
                                        note={note}
                                        index={idx}
                                        onPress={() => openNote(router, note)}
                                        onUploaderPress={() => (note.uploaderId || note.uploadedBy?.id) ? router.push(`/contributor/${note.uploaderId || note.uploadedBy?.id}`) : undefined}
                                    />
                                ))
                            ) : (
                                <EmptyState icon="search-outline" title="No results" message="Try a different search." />
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchContainer: { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.sm, paddingBottom: spacing.sm },
    coursesWrap: { paddingHorizontal: spacing.screenPadding, marginBottom: spacing.sm },
    coursesLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
    coursesScroll: { gap: spacing.sm },
    courseCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
        borderRadius: 12, backgroundColor: colors.cardBackground,
        borderWidth: 1, borderColor: colors.border,
    },
    courseCardName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary, maxWidth: 120 },
    primaryTabsRow: {
        flexDirection: 'row', paddingHorizontal: spacing.screenPadding,
        gap: spacing.sm, marginBottom: spacing.sm,
    },
    primaryTab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.xs, paddingVertical: spacing.sm,
        borderRadius: 999, backgroundColor: colors.cardBackground,
        borderWidth: 1, borderColor: colors.border,
    },
    primaryTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabsScroll: { marginBottom: spacing.sm },
    tabsContent: { paddingHorizontal: spacing.screenPadding, gap: spacing.sm },
    tab: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: 999, backgroundColor: colors.cardBackground,
        borderWidth: 1, borderColor: colors.border,
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
    tabLabelActive: { color: colors.textOnPrimary },
    sortRow: { flexDirection: 'row', paddingHorizontal: spacing.screenPadding, gap: spacing.sm, marginBottom: spacing.md },
    sortChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
        borderRadius: 999, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border,
    },
    sortChipActive: { backgroundColor: 'rgba(91, 127, 255, 0.10)', borderColor: colors.primary },
    sortChipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
    sortChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
    content: { padding: spacing.screenPadding, paddingTop: 0 },
    skeletonWrap: { padding: spacing.screenPadding, paddingTop: spacing.md },
    courseSection: { marginBottom: spacing.xl },
    courseHeader: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        marginBottom: spacing.md, paddingBottom: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    courseTitle: {
        fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    semesterSection: { marginBottom: spacing.md, marginLeft: spacing.md },
    semesterTitle: {
        fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary, marginBottom: spacing.sm,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
});
