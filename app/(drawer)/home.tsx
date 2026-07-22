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
import SearchNoteCard from '../../components/SearchNoteCard';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const COURSE_IMAGES: Record<string, string> = {
    'btech-cse': 'https://images.unsplash.com/photo-1542831371-32f555c86880?auto=format&fit=crop&w=400&q=80',
    'btech-me': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=400&q=80',
    'btech-ee': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    bca: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
    mca: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    diploma: 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=400&q=80',
    'bca-web': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
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

export default function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const { courses, featured, categories, isLoading, refetch: refetchCourses } = useCourses();
    const { results: noteResults, isSearching: isSearchingNotes, error: searchError } =
        useNoteSearch(searchQuery);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchCourses();
        setRefreshing(false);
    }, [refetchCourses]);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        if (text.trim().length >= 2) {
            setRecentSearches(prev => {
                const filtered = prev.filter(s => s !== text.trim());
                return [text.trim(), ...filtered].slice(0, 5);
            });
        }
    }, []);

    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
    }, []);

    const filteredCourses = useMemo(() => {
        const byCategory =
            activeCategory === 'All'
                ? courses
                : courses.filter((course) => course.category === activeCategory);

        if (!normalizedQuery) return byCategory;

        return byCategory.filter((course) =>
            [course.title, course.category, course.instructor].some((value) =>
                value.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [activeCategory, courses, normalizedQuery]);

    const filteredFeatured = useMemo(() => {
        if (!normalizedQuery) return featured;

        return featured.filter((course) =>
            [course.title, course.category, course.instructor].some((value) =>
                value.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [featured, normalizedQuery]);

    const getCourseImage = (courseId: string) =>
        COURSE_IMAGES[courseId] || `https://picsum.photos/seed/${courseId}/400/200`;

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
                            <SearchBar
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholder="Search for notes, courses..."
                            />
                        </Animated.View>

                        {!normalizedQuery && recentSearches.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(120).springify().damping(14)} style={styles.recentSearchCard}>
                                <View style={styles.recentSearchHeader}>
                                    <Text style={styles.recentSearchTitle}>Recent Searches</Text>
                                    <TouchableOpacity onPress={clearRecentSearches} hitSlop={8}>
                                        <Text style={styles.clearRecentText}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.recentSearchList}>
                                    {recentSearches.map((term, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.recentSearchItem}
                                            onPress={() => setSearchQuery(term)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="time-outline" size={16} color={colors.textLight} />
                                            <Text style={styles.recentSearchTerm}>{term}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesContainer}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {categories.map((category, index) => (
                                <Animated.View key={category} entering={FadeInRight.delay(130 + index * 45)}>
                                    <CategoryPill
                                        label={category}
                                        icon={CATEGORY_ICONS[category]}
                                        isActive={activeCategory === category}
                                        onPress={() => setActiveCategory(category)}
                                    />
                                </Animated.View>
                            ))}
                        </ScrollView>

                        {normalizedQuery.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Notes</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Notes shared by students and course materials
                                </Text>
                                {isSearchingNotes ? (
                                    <View style={styles.skeletonWrap}>
                                        <LoadingSkeleton.Card lines={2} />
                                        <LoadingSkeleton.Card lines={2} />
                                    </View>
                                ) : searchError ? (
                                    <EmptyState
                                        icon="alert-circle-outline"
                                        title="Search failed"
                                        message={searchError}
                                        secondaryActionLabel="Try Again"
                                        onSecondaryAction={() => {}}
                                    />
                                ) : noteResults.length > 0 ? (
                                    noteResults.map((note, idx) => (
                                        <SearchNoteCard
                                            key={note.id}
                                            note={note}
                                            index={idx}
                                            onPress={() => openNote(router, note)}
                                        />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon="document-outline"
                                        title="No notes found"
                                        message="No notes match your search. Try a different query."
                                    />
                                )}
                            </View>
                        )}

                        {isLoading ? (
                            <View style={styles.skeletonWrap}>
                                <LoadingSkeleton.CourseCard />
                                <LoadingSkeleton.CourseCard />
                                <LoadingSkeleton.CourseCard />
                            </View>
                        ) : (
                            <>
                                {filteredFeatured.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionTitle}>Featured Courses</Text>
                                            <TouchableOpacity style={styles.topPicksPill}>
                                                <Text style={styles.topPicksText}>Top Picks</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.featuredContent}
                                        >
                                            {filteredFeatured.map((course, idx) => (
                                                <Animated.View key={course.id} entering={FadeInRight.delay(180 + idx * 70)}>
                                                    <MarketplaceCard
                                                        {...course}
                                                        imageUrl={getCourseImage(course.id)}
                                                        horizontal
                                                        onPress={() => router.push(`/course/${course.id}`)}
                                                    />
                                                </Animated.View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Explore Marketplace</Text>
                                    <Text style={styles.sectionSubtitle}>
                                        {normalizedQuery
                                            ? `Showing results for "${searchQuery.trim()}"`
                                            : 'Discover all engineering and degree notes'}
                                    </Text>

                                    <View style={styles.grid}>
                                        {filteredCourses.map((course, idx) => (
                                            <Animated.View key={course.id} entering={FadeInDown.delay(240 + idx * 45).springify().damping(12)}>
                                                <MarketplaceCard
                                                    {...course}
                                                    imageUrl={getCourseImage(course.id)}
                                                    onPress={() => router.push(`/course/${course.id}`)}
                                                />
                                            </Animated.View>
                                        ))}

                                        {filteredCourses.length === 0 && (
                                            <EmptyState
                                                icon="search-outline"
                                                title="No courses found"
                                                message="No courses match your current search or filter."
                                            />
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>

                <BottomBar
                    activeTab="home"
                    onTabPress={(tab) => {
                        if (tab === 'save') router.push('/saved');
                        else if (tab === 'downloads') router.push('/downloads');
                        else if (tab === 'more') navigation.openDrawer();
                    }}
                    onAddPress={() => router.push('/upload-note')}
                />
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: 120,
    },
    searchWrap: {
        marginBottom: spacing.sm,
    },
    categoriesContainer: {
        marginBottom: spacing.xl,
    },
    categoriesContent: {
        paddingRight: spacing.screenPadding,
    },
    skeletonWrap: {
        marginTop: spacing.md,
    },
    recentSearchCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    recentSearchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    recentSearchTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
    },
    clearRecentText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    recentSearchList: {
        gap: spacing.xs,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xs + 2,
    },
    recentSearchTerm: {
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: spacing.md,
    },
    topPicksPill: {
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    topPicksText: {
        color: colors.primary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },
    featuredContent: {
        paddingRight: spacing.screenPadding,
        gap: spacing.md,
    },
    grid: {
        gap: spacing.md,
    },

});
