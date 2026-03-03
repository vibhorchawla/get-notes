import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
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

const CATEGORIES = ['All', 'B.Tech', 'BCA', 'MCA', 'Diploma', 'Arts', 'Science'];

const FEATURED_COURSES = [
    {
        id: 'btech-cse',
        title: 'Advanced Data Structures & Algorithms',
        category: 'B.Tech CSE',
        rating: 4.8,
        students: '1.2k',
        instructor: 'Dr. Sarah Wilson',
        icon: 'laptop-outline' as const,
    },
    {
        id: 'bca-web',
        title: 'Full Stack Web Development 2026',
        category: 'BCA',
        rating: 4.6,
        students: '850',
        instructor: 'John Doe',
        icon: 'code-slash-outline' as const,
    },
];

const ALL_COURSES = [
    { id: 'btech-cse', title: 'B.Tech CSE', category: 'Engineering', rating: 4.5, students: '4.2k', instructor: 'Tech Faculty', icon: 'laptop-outline' as const },
    { id: 'btech-me', title: 'B.Tech ME', category: 'Engineering', rating: 4.2, students: '2.1k', instructor: 'Mechanical Dept', icon: 'construct-outline' as const },
    { id: 'btech-ee', title: 'B.Tech EE', category: 'Engineering', rating: 4.3, students: '1.8k', instructor: 'Electrical Dept', icon: 'flash-outline' as const },
    { id: 'bca', title: 'BCA', category: 'Computer Apps', rating: 4.4, students: '3.5k', instructor: 'BCA Faculty', icon: 'school-outline' as const },
    { id: 'mca', title: 'MCA', category: 'Computer Apps', rating: 4.7, students: '1.2k', instructor: 'Post-Grad Faculty', icon: 'document-text-outline' as const },
    { id: 'diploma', title: 'Polytechnic Diploma', category: 'Technical', rating: 4.0, students: '5.2k', instructor: 'Diploma Board', icon: 'settings-outline' as const },
];

export default function HomeScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const handleCoursePress = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

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
                        {CATEGORIES.map((cat) => (
                            <CategoryPill
                                key={cat}
                                label={cat}
                                isActive={activeCategory === cat}
                                onPress={() => setActiveCategory(cat)}
                            />
                        ))}
                    </ScrollView>

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
                            {FEATURED_COURSES.map((course) => (
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
                            {ALL_COURSES.map((course) => (
                                <MarketplaceCard
                                    key={course.id}
                                    {...course}
                                    onPress={() => handleCoursePress(course.id)}
                                />
                            ))}
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

