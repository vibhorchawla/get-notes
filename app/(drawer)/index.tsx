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
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import MarketplaceCard from '../../components/MarketplaceCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useCourses } from '../../hooks/useCourses';
import { useAuth } from '../../context/AuthContext';

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

const VALUE_POINTS = [
    {
        icon: 'flash-outline',
        title: 'Fast Discovery',
        description: 'Search by course, instructor, or category in one place.',
    },
    {
        icon: 'cloud-upload-outline',
        title: 'Learner Contributions',
        description: 'Students can upload and organize their own notes in minutes.',
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Panel-Ready Experience',
        description: 'Structured content, clear navigation, and presentation-friendly polish.',
    },
];

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function ValueCard({
    icon,
    title,
    description,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.valueCard}>
            <View style={styles.valueIconWrap}>
                <Ionicons name={icon} size={20} color={colors.textOnPrimary} />
            </View>
            <Text style={styles.valueTitle}>{title}</Text>
            <Text style={styles.valueDescription}>{description}</Text>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { courses, featured, categories, isLoading } = useCourses();

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredCourses = useMemo(() => {
        const byCategory =
            activeCategory === 'All'
                ? courses
                : courses.filter((course) => course.category === activeCategory);

        if (!normalizedQuery) {
            return byCategory;
        }

        return byCategory.filter((course) =>
            [course.title, course.category, course.instructor].some((value) =>
                value.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [activeCategory, courses, normalizedQuery]);

    const filteredFeatured = useMemo(() => {
        if (!normalizedQuery) {
            return featured;
        }

        return featured.filter((course) =>
            [course.title, course.category, course.instructor].some((value) =>
                value.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [featured, normalizedQuery]);

    const handleCoursePress = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    const handleUploadPress = () => {
        router.push('/upload-note');
    };

    const getCourseImage = (courseId: string) => {
        return COURSE_IMAGES[courseId] || `https://picsum.photos/seed/${courseId}/400/200`;
    };

    const heroTitle = user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Academic notes, presented like a product';

    return (
        <GradientBackground>
            <View style={styles.screen}>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <Header />

                    <View style={styles.content}>
                        <Animated.View entering={FadeInDown.delay(60).springify().damping(14)} style={styles.heroCard}>
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search for notes, courses..."
                            />

                            <View style={styles.heroBadge}>
                                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                                <Text style={styles.heroBadgeText}>Built for students, polished for stakeholders</Text>
                            </View>

                            <Text style={styles.heroTitle}>{heroTitle}</Text>
                            <Text style={styles.heroSubtitle}>
                                GetNotes brings course discovery, learner uploads, and quick PDF access into a single mobile experience
                                that feels ready for campus partnerships.
                            </Text>

                            <View style={styles.heroActions}>
                                <TouchableOpacity style={styles.primaryAction} onPress={handleUploadPress}>
                                    <Ionicons name="add-circle-outline" size={18} color={colors.textOnPrimary} />
                                    <Text style={styles.primaryActionText}>Upload Notes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryAction}
                                    onPress={() => router.push('/notes')}
                                >
                                    <Text style={styles.secondaryActionText}>View My Notes</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)} style={styles.statsRow}>
                            <StatCard label="Courses" value={String(courses.length)} icon="layers-outline" />
                            <StatCard label="Featured" value={String(featured.length)} icon="star-outline" />
                            <StatCard label="Categories" value={String(categories.filter((item) => item !== 'All').length)} icon="grid-outline" />
                        </Animated.View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesContainer}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {categories.map((category, index) => (
                                <Animated.View key={category} entering={FadeInRight.delay(220 + index * 40)}>
                                    <CategoryPill
                                        label={category}
                                        icon={CATEGORY_ICONS[category]}
                                        isActive={activeCategory === category}
                                        onPress={() => setActiveCategory(category)}
                                    />
                                </Animated.View>
                            ))}
                        </ScrollView>

                        <Animated.View entering={FadeInDown.delay(260).springify().damping(14)} style={styles.valueSection}>
                            {VALUE_POINTS.map((point) => (
                                <ValueCard
                                    key={point.title}
                                    icon={point.icon as keyof typeof Ionicons.glyphMap}
                                    title={point.title}
                                    description={point.description}
                                />
                            ))}
                        </Animated.View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
                        ) : (
                            <>
                                {filteredFeatured.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View>
                                                <Text style={styles.sectionEyebrow}>Featured Collection</Text>
                                                <Text style={styles.sectionTitle}>High-demand programs</Text>
                                            </View>
                                            <TouchableOpacity style={styles.ghostPill} onPress={() => setActiveCategory('All')}>
                                                <Text style={styles.ghostPillText}>Reset Filter</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.featuredContent}
                                        >
                                            {filteredFeatured.map((course, idx) => (
                                                <Animated.View key={course.id} entering={FadeInRight.delay(320 + idx * 80)}>
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

                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <View>
                                            <Text style={styles.sectionEyebrow}>Marketplace</Text>
                                            <Text style={styles.sectionTitle}>Discover structured note collections</Text>
                                            <Text style={styles.sectionSubtitle}>
                                                {normalizedQuery
                                                    ? `Showing results for "${searchQuery.trim()}"`
                                                    : activeCategory === 'All'
                                                      ? 'Browse every available course in the marketplace'
                                                      : `Focused on ${activeCategory}`}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.grid}>
                                        {filteredCourses.map((course, idx) => (
                                            <Animated.View key={course.id} entering={FadeInDown.delay(360 + idx * 45).springify().damping(12)}>
                                                <MarketplaceCard
                                                    {...course}
                                                    imageUrl={getCourseImage(course.id)}
                                                    onPress={() => handleCoursePress(course.id)}
                                                />
                                            </Animated.View>
                                        ))}

                                        {filteredCourses.length === 0 && (
                                            <View style={styles.emptyState}>
                                                <Ionicons name="search-outline" size={28} color={colors.textLight} />
                                                <Text style={styles.emptyTitle}>No matches found</Text>
                                                <Text style={styles.emptyText}>
                                                    Try another search term or switch categories to surface more programs.
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <Animated.View entering={FadeInDown.delay(480).springify().damping(14)} style={styles.ctaCard}>
                                    <View style={styles.ctaCopy}>
                                        <Text style={styles.ctaTitle}>Turn class notes into a shared resource</Text>
                                        <Text style={styles.ctaText}>
                                            Upload your own notes, keep them organized in one place, and open them directly as PDFs from My Notes.
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.ctaButton} onPress={handleUploadPress}>
                                        <Text style={styles.ctaButtonText}>Add a Note</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </>
                        )}
                    </View>
                </ScrollView>

                <FloatingActionButton onPress={handleUploadPress} />
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
    heroCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 28,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.12)',
        shadowColor: '#1E1B4B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: spacing.lg,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    heroBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    heroTitle: {
        fontSize: 30,
        lineHeight: 36,
        color: colors.textPrimary,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.md,
        lineHeight: 24,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    heroActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    primaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: spacing.xs,
    },
    primaryActionText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
    secondaryAction: {
        backgroundColor: colors.background,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryActionText: {
        color: colors.textPrimary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    statLabel: {
        marginTop: 2,
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    categoriesContainer: {
        marginBottom: spacing.lg,
    },
    categoriesContent: {
        paddingRight: spacing.screenPadding,
    },
    valueSection: {
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    valueCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: spacing.md,
    },
    valueIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    valueTitle: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 4,
    },
    valueDescription: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: typography.fontSize.sm,
        lineHeight: 20,
    },
    loadingIndicator: {
        marginTop: spacing.xl,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    sectionEyebrow: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    ghostPill: {
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ghostPillText: {
        color: colors.textPrimary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
    featuredContent: {
        paddingRight: spacing.screenPadding,
        gap: spacing.md,
    },
    grid: {
        gap: spacing.md,
    },
    emptyState: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: spacing.sm,
        marginBottom: 4,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        lineHeight: 20,
    },
    ctaCard: {
        backgroundColor: '#E0E7FF',
        borderRadius: 28,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    ctaCopy: {
        marginBottom: spacing.md,
    },
    ctaTitle: {
        color: '#312E81',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
    },
    ctaText: {
        color: '#4338CA',
        fontSize: typography.fontSize.sm,
        lineHeight: 21,
    },
    ctaButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#312E81',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    ctaButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
});
