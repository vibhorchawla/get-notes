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
import GradientBackground from '../../components/GradientBackground';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import MarketplaceCard from '../../components/MarketplaceCard';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useCourses } from '../../hooks/useCourses';

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

    return (
        <GradientBackground>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Header />

                <View style={styles.content}>
                    {/* Search Section */}
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    {/* Categories Section */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesContainer}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        {categories.map((cat) => (
                            <CategoryPill
                                key={cat}
                                label={cat}
                                isActive={activeCategory === cat}
                                onPress={() => setActiveCategory(cat)}
                            />
                        ))}
                    </ScrollView>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                    ) : (
                        <>
                            {/* Featured Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Featured Courses</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.viewAll}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredContent}
                                >
                                    {featured.map((course) => (
                                        <MarketplaceCard
                                            key={course.id}
                                            {...course}
                                            horizontal
                                            onPress={() => handleCoursePress(course.id)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>

                            {/* All Courses Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Explore Courses</Text>
                                </View>
                                <View style={styles.grid}>
                                    {filteredCourses.map((course) => (
                                        <MarketplaceCard
                                            key={course.id}
                                            {...course}
                                            onPress={() => handleCoursePress(course.id)}
                                        />
                                    ))}
                                </View>
                            </View>
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
        marginBottom: spacing.lg,
    },
    categoriesContent: {
        paddingRight: spacing.screenPadding,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    viewAll: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    featuredContent: {
        paddingRight: spacing.screenPadding,
    },
    grid: {
        gap: spacing.md,
    },
});
