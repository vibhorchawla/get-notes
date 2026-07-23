import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import MarketplaceCard from '../../components/MarketplaceCard';
import BottomBar from '../../components/BottomBar';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useCourses } from '../../hooks/useCourses';
import { useNoteSearch } from '../../hooks/useNoteSearch';
import { useCommunity } from '../../hooks/useCommunity';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { useSaved } from '../../hooks/useSaved';
import SearchNoteCard from '../../components/SearchNoteCard';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const COURSE_IMAGES: Record<string, string> = {
    'B.Tech CSE': 'https://images.unsplash.com/photo-1542831371-32f555c86880?auto=format&fit=crop&w=400&q=80',
    'B.Tech ME': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=400&q=80',
    'B.Tech EE': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    BCA: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
    MCA: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    'Diploma CSE': 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=400&q=80',
    'Polytechnic Diploma': 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=400&q=80',
};

const CATEGORY_ICONS: Record<string, any> = {
    All: 'grid-outline',
    'B.Tech': 'laptop-outline',
    BCA: 'code-slash-outline',
    MCA: 'server-outline',
    Diploma: 'settings-outline',
    Arts: 'color-palette-outline',
    Science: 'flask-outline',
};

function NoteCard({ note, onPress }: { note: any; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.noteCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.noteCardHeader}>
                <View style={styles.noteIcon}>
                    <Ionicons name="document-text" size={18} color={colors.primary} />
                </View>
                <Text style={styles.noteCardSubject} numberOfLines={1}>{note.subject}</Text>
            </View>
            <Text style={styles.noteCardTitle} numberOfLines={2}>{note.title}</Text>
            <View style={styles.noteCardFooter}>
                <View style={styles.noteStat}>
                    <Ionicons name="download-outline" size={12} color={colors.textLight} />
                    <Text style={styles.noteStatText}>{note.downloads || 0}</Text>
                </View>
                <View style={styles.noteStat}>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text style={styles.noteStatText}>{(note.averageRating || 0).toFixed(1)}</Text>
                </View>
                {note.uploaderName ? (
                    <Text style={styles.noteCardUploader} numberOfLines={1}>{note.uploaderName}</Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const { courses, featured, categories, isLoading: coursesLoading, refetch: refetchCourses } = useCourses();
    const { data: community, isLoading: communityLoading, refetch: refetchCommunity } = useCommunity();
    const { results: noteResults, isSearching: isSearchingNotes, error: searchError } = useNoteSearch(searchQuery);
    const { notes: personalNotes } = usePersonalNotes();
    const { savedNotes } = useSaved();

    const continueReading = personalNotes.slice(0, 5);
    const isLoading = coursesLoading || communityLoading;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchCourses(), refetchCommunity()]);
        setRefreshing(false);
    }, [refetchCourses, refetchCommunity]);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const handleSearch = useCallback((text: string) => setSearchQuery(text), []);

    const filteredCourses = useMemo(() => {
        const byCategory = activeCategory === 'All' ? courses : courses.filter((c) => c.category === activeCategory);
        if (!normalizedQuery) return byCategory;
        return byCategory.filter((c) => [c.name, c.category].some((v) => v?.toLowerCase().includes(normalizedQuery)));
    }, [activeCategory, courses, normalizedQuery]);

    return (
        <GradientBackground>
            <View style={styles.screen}>
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <Header />
                    <View style={styles.content}>
                        <Animated.View entering={FadeInDown.delay(80).springify().damping(14)} style={styles.searchWrap}>
                            <SearchBar value={searchQuery} onChangeText={handleSearch} placeholder="Search notes, subjects, courses..." />
                        </Animated.View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer} contentContainerStyle={styles.categoriesContent}>
                            {categories.map((category, index) => (
                                <Animated.View key={category} entering={FadeInRight.delay(130 + index * 45)}>
                                    <CategoryPill label={category} icon={CATEGORY_ICONS[category]} isActive={activeCategory === category} onPress={() => setActiveCategory(category)} />
                                </Animated.View>
                            ))}
                        </ScrollView>

                        {normalizedQuery.length > 0 ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Search Results</Text>
                                {isSearchingNotes ? (
                                    <LoadingSkeleton.Card lines={2} />
                                ) : searchError ? (
                                    <EmptyState icon="alert-circle-outline" title="Search failed" message={searchError} />
                                ) : noteResults.length > 0 ? (
                                    noteResults.map((note, idx) => (
                                        <SearchNoteCard key={note.id} note={note} index={idx} onPress={() => openNote(router, note)} />
                                    ))
                                ) : (
                                    <EmptyState icon="document-outline" title="No notes found" message="Try a different search query." />
                                )}
                            </View>
                        ) : isLoading ? (
                            <View style={styles.skeletonWrap}><LoadingSkeleton.CourseCard /><LoadingSkeleton.CourseCard /><LoadingSkeleton.CourseCard /></View>
                        ) : (
                            <>
                                {community?.trending?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="flame" size={20} color="#FF6B35" /><Text style={styles.sectionTitle}> Trending Notes</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/community')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {community.trending.slice(0, 10).map((note) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {community?.topRated?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="star" size={20} color="#FFC107" /><Text style={styles.sectionTitle}> Top Rated</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/community')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {community.topRated.slice(0, 10).map((note) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {community?.subjects?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="book" size={20} color={colors.primary} /><Text style={styles.sectionTitle}> Popular Subjects</Text></View>
                                        </View>
                                        <View style={styles.subjectGrid}>
                                            {community.subjects.slice(0, 6).map((subject) => (
                                                <TouchableOpacity key={subject.id} style={styles.subjectCard} onPress={() => router.push('/community')} activeOpacity={0.7}>
                                                    <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                                                    <Text style={styles.subjectName} numberOfLines={2}>{subject.name}</Text>
                                                    <Text style={styles.subjectCount}>{subject.noteCount} notes</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {community?.recent?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="time-outline" size={20} color={colors.secondary} /><Text style={styles.sectionTitle}> Recent Uploads</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/community')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {community.recent.slice(0, 10).map((note) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {community?.contributors?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="trophy" size={20} color="#FFC107" /><Text style={styles.sectionTitle}> Top Contributors</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/community')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <View style={styles.contributorList}>
                                            {community.contributors.slice(0, 5).map((c, idx) => (
                                                <View key={c.userId} style={styles.contributorRow}>
                                                    <View style={styles.contributorRank}><Text style={styles.rankText}>{idx + 1}</Text></View>
                                                    <View style={styles.contributorInfo}>
                                                        <Text style={styles.contributorName}>User {c.userId.slice(-4)}</Text>
                                                        <Text style={styles.contributorBadge}>{c.currentBadge?.name || '🌟 Beginner'}</Text>
                                                    </View>
                                                    <Text style={styles.contributorPoints}>{c.points} pts</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {featured?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="star" size={20} color="#FFC107" /><Text style={styles.sectionTitle}> Featured Courses</Text></View>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {featured.slice(0, 10).map((note: any) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {savedNotes.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="bookmark" size={20} color={colors.primary} /><Text style={styles.sectionTitle}> Saved Notes</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/(drawer)/saved')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {savedNotes.slice(0, 10).map((note) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {continueReading.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="time-outline" size={20} color={colors.secondary} /><Text style={styles.sectionTitle}> Continue Reading</Text></View>
                                            <TouchableOpacity onPress={() => router.push('/(drawer)/notes')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {continueReading.map((note) => (
                                                <NoteCard key={note.id} note={note} onPress={() => openNote(router, note)} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {community?.colleges?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleRow}><Ionicons name="business" size={20} color={colors.accent} /><Text style={styles.sectionTitle}> Popular Colleges</Text></View>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                            {community.colleges.slice(0, 10).map((college) => (
                                                <TouchableOpacity key={college.id} style={styles.collegeCard} activeOpacity={0.7}>
                                                    <Ionicons name="school" size={28} color={colors.primary} />
                                                    <Text style={styles.collegeName} numberOfLines={2}>{college.name}</Text>
                                                    <Text style={styles.collegeStat}>{college.noteCount} notes</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Explore Courses</Text>
                                    <Text style={styles.sectionSubtitle}>Browse notes by your course</Text>
                                    <View style={styles.grid}>
                                        {filteredCourses.map((course, idx) => (
                                            <Animated.View key={course.id} entering={FadeInDown.delay(240 + idx * 45).springify().damping(12)}>
                                                <MarketplaceCard
                                                    title={course.name}
                                                    category={course.category || ''}
                                                    rating={4.5} students="" instructor="" icon={course.icon || 'school-outline'}
                                                    imageUrl={COURSE_IMAGES[course.name] || COURSE_IMAGES[course.id]}
                                                    onPress={() => router.push(`/course/${course.id}`)}
                                                />
                                            </Animated.View>
                                        ))}
                                        {filteredCourses.length === 0 && <EmptyState icon="search-outline" title="No courses found" message="Try a different filter." />}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>

                <BottomBar
                    activeTab="home"
                    onTabPress={(tab) => {
                        if (tab === 'community') router.push('/community');
                        else if (tab === 'save') router.push('/saved');
                        else if (tab === 'more') navigation.openDrawer();
                    }}
                    onAddPress={() => router.push('/upload-note')}
                />
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: { flex: 1 },
    content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 120 },
    searchWrap: { marginBottom: spacing.sm },
    categoriesContainer: { marginBottom: spacing.xl },
    categoriesContent: { paddingRight: spacing.screenPadding },
    skeletonWrap: { marginTop: spacing.md },
    section: { marginBottom: spacing.xxl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    sectionSubtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
    seeAll: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.semibold },
    horizontalScroll: { paddingRight: spacing.screenPadding, gap: spacing.sm },
    noteCard: { width: 200, backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    noteCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    noteIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(79, 70, 229, 0.1)', justifyContent: 'center', alignItems: 'center' },
    noteCardSubject: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold, flex: 1 },
    noteCardTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm, lineHeight: 18 },
    noteCardUploader: { fontSize: 10, color: colors.textLight, flex: 1 },
    noteCardFooter: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    noteStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    noteStatText: { fontSize: 10, color: colors.textLight },
    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    subjectCard: { width: '31%', backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    subjectName: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xs },
    subjectCount: { fontSize: 10, color: colors.textLight, marginTop: 2 },
    contributorList: { gap: spacing.sm },
    contributorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
    contributorRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(79, 70, 229, 0.1)', justifyContent: 'center', alignItems: 'center' },
    rankText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary },
    contributorInfo: { flex: 1 },
    contributorName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    contributorBadge: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    contributorPoints: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary },
    collegeCard: { width: 140, backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    collegeName: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xs },
    collegeStat: { fontSize: 10, color: colors.textLight, marginTop: 2 },
    grid: { gap: spacing.md },
});
