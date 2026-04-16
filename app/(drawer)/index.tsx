import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import MarketplaceCard from '../../components/MarketplaceCard';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useCourses } from '../../hooks/useCourses';

const COURSE_IMAGES: Record<string, string> = {
    'btech-cse': 'https://images.unsplash.com/photo-1542831371-32f555c86880?auto=format&fit=crop&w=400&q=80',
    'btech-me': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=400&q=80',
    'btech-ee': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    'bca': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
    'mca': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    'diploma': 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=400&q=80',
    'bca-web': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
};

const CATEGORY_ICONS: Record<string, any> = {
    'All': 'grid-outline',
    'B.Tech': 'laptop-outline',
    'BCA': 'code-slash-outline',
    'MCA': 'server-outline',
    'Diploma': 'settings-outline',
    'Arts': 'brush-outline',
    'Science': 'flask-outline',
};

export default function HomeScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { courses, featured, categories, isLoading } = useCourses();

    const handleCoursePress = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    const filteredCourses = activeCategory === 'All'
        ? courses
        : courses.filter((c) => c.category === activeCategory);

    const getCourseImage = (courseId: string) => {
        return COURSE_IMAGES[courseId] || `https://picsum.photos/seed/${courseId}/400/200`;
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Header />

                <View style={styles.content}>
                    {/* Search Section */}
                    <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </Animated.View>

                    {/* Categories Section */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesContainer}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        {categories.map((cat, index) => (
                            <Animated.View key={cat} entering={FadeInRight.delay(200 + index * 50)}>
                                <CategoryPill
                                    label={cat}
                                    icon={CATEGORY_ICONS[cat]}
                                    isActive={activeCategory === cat}
                                    onPress={() => setActiveCategory(cat)}
                                />
                            </Animated.View>
                        ))}
                    </ScrollView>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                    ) : (
                        <>
                            {/* Featured Section */}
                            {featured.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>Featured Courses</Text>
                                        <TouchableOpacity style={styles.viewAllBtn}>
                                            <Text style={styles.viewAll}>Top Picks</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.featuredContent}
                                    >
                                        {featured.map((course, idx) => (
                                            <Animated.View key={course.id} entering={FadeInRight.delay(300 + idx * 100)}>
                                                <MarketplaceCard
                                                    {...course}
                                                    imageUrl={getCourseImage(course.id)}
                                                    horizontal
                                                    onPress={() => handleCoursePress(course.id)}
                                                />
                                            </Animated.View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* All Courses Section */}
                            <Animated.View entering={FadeInDown.delay(400).springify().damping(14)} style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Explore Marketplace 🚀</Text>
                                        <Text style={styles.sectionSubtitle}>
                                            {activeCategory === 'All' ? 'Discover all engineering & degree notes' : `Showing results for ${activeCategory}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.grid}>
                                    {filteredCourses.map((course, idx) => (
                                        <Animated.View key={course.id} entering={FadeInDown.delay(450 + (idx * 50)).springify().damping(12)}>
                                            <MarketplaceCard
                                                {...course}
                                                imageUrl={getCourseImage(course.id)}
                                                onPress={() => handleCoursePress(course.id)}
                                            />
                                        </Animated.View>
                                    ))}
                                    {filteredCourses.length === 0 && (
                                        <Text style={styles.emptyText}>No courses found in this category.</Text>
                                    )}
                                </View>
                            </Animated.View>
                        </>
                    )}
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
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xl,
    },
    categoriesContainer: {
        marginBottom: spacing.xl,
    },
    categoriesContent: {
        paddingRight: spacing.screenPadding,
    },
    section: {
        marginBottom: spacing.xxl || 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl || 22,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary, // Changed from hardcoded #1a1a2e for dark mode compatibility
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    viewAllBtn: {
        backgroundColor: 'rgba(168, 197, 230, 0.2)', // Soft primary tint
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewAll: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
    },
    featuredContent: {
        paddingRight: spacing.screenPadding,
        gap: spacing.md,
    },
    grid: {
        gap: spacing.lg,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: spacing.xl,
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
    },
});
