import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSemesters } from '../../hooks/useSemesters';
import { useSubjects, useSubjectNotes } from '../../hooks/useSemesters';
import { apiFetch } from '../../hooks/useApi';
import { Course } from '../../types/note';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function CourseScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const { semesters, isLoading: semLoading } = useSemesters(id);

    useEffect(() => {
        async function loadCourse() {
            try {
                const res = await apiFetch<Course>(`/courses/${id}`, { requiresAuth: false });
                if (res.success && res.data) setCourse(res.data);
            } catch {}
        }
        loadCourse();
    }, [id]);

    const now = new Date();
    const isPremium = user?.isPremium && user?.premiumEndDate ? new Date(user.premiumEndDate) > now : false;

    return (
        <>
            <Stack.Screen
                options={{
                    title: course?.name || 'Course',
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.white,
                }}
            />
            <GradientBackground>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{course?.name || 'Course Notes'}</Text>
                        <Text style={styles.subtitle}>Select a semester to browse notes</Text>

                        {semLoading ? (
                            <View style={styles.skeletonWrap}>
                                <LoadingSkeleton.Card lines={1} />
                                <LoadingSkeleton.Card lines={1} />
                                <LoadingSkeleton.Card lines={1} />
                            </View>
                        ) : semesters.length > 0 ? (
                            <View style={styles.semesterList}>
                                {semesters.map((sem) => (
                                    <TouchableOpacity
                                        key={sem.id}
                                        style={styles.semesterCard}
                                        onPress={() => router.push(`/semester/${sem.id}?courseName=${course?.name || ''}&semester=${sem.number}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.semesterIcon}>
                                            <Ionicons name="layers-outline" size={28} color={colors.primary} />
                                        </View>
                                        <View style={styles.semesterInfo}>
                                            <Text style={styles.semesterName}>Semester {sem.number}</Text>
                                            <Text style={styles.semesterSub}>Browse all subjects and notes</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <EmptyState
                                icon="school-outline"
                                title="No semesters yet"
                                message="Semesters for this course haven't been added yet."
                            />
                        )}
                    </View>
                </ScrollView>
            </GradientBackground>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.screenPadding },
    title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
    subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
    skeletonWrap: { gap: spacing.sm },
    semesterList: { gap: spacing.md },
    semesterCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    semesterIcon: {
        width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    semesterInfo: { flex: 1 },
    semesterName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    semesterSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
});
