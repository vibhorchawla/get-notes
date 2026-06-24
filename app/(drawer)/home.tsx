import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import MarketplaceCard from '../../components/MarketplaceCard';
import FloatingActionButton from '../../components/FloatingActionButton';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { courses, featured, categories, isLoading } = useCourses();
    const { results: noteResults, isSearching: isSearchingNotes, error: searchError } =
        useNoteSearch(searchQuery);

    const normalizedQuery = searchQuery.trim().toLowerCase();

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
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <Header />

                    <View style={styles.content}>
                        <Animated.View entering={FadeInDown.delay(80).springify().damping(14)} style={styles.searchWrap}>
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search for notes, courses..."
                            />
                        </Animated.View>

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
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primary}
                                        style={styles.noteSearchLoader}
                                    />
                                ) : searchError ? (
                                    <Text style={styles.searchErrorText}>{searchError}</Text>
                                ) : noteResults.length > 0 ? (
                                    noteResults.map((note) => (
                                        <SearchNoteCard
                                            key={note.id}
                                            note={note}
                                            onPress={() => openNote(router, note)}
                                        />
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="document-outline" size={24} color={colors.textLight} />
                                        <Text style={styles.emptyText}>No notes found for this search.</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
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
                                            <View style={styles.emptyState}>
                                                <Ionicons name="search-outline" size={26} color={colors.textLight} />
                                                <Text style={styles.emptyText}>No courses found for this search.</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>

                <FloatingActionButton onPress={() => router.push('/upload-note')} />
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
    loader: {
        marginTop: spacing.xl,
    },
    noteSearchLoader: {
        marginVertical: spacing.md,
    },
    searchErrorText: {
        color: colors.error,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
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
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyText: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
    },
});
