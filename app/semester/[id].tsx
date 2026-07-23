import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import { useSubjects } from '../../hooks/useSemesters';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function SemesterScreen() {
    const { id, courseName, semester } = useLocalSearchParams<{ id: string; courseName: string; semester: string }>();
    const router = useRouter();
    const { subjects, isLoading } = useSubjects(id);

    return (
        <>
            <Stack.Screen
                options={{
                    title: `Semester ${semester} - ${courseName || ''}`,
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.white,
                }}
            />
            <GradientBackground>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Semester {semester}</Text>
                        <Text style={styles.subtitle}>{courseName}</Text>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                        ) : subjects.length > 0 ? (
                            <View style={styles.subjectList}>
                                {subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        style={styles.subjectCard}
                                        onPress={() => router.push(`/subject/${subject.id}?name=${encodeURIComponent(subject.name)}&semester=${semester}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.subjectIcon}>
                                            <Ionicons name="book-outline" size={24} color={colors.primary} />
                                        </View>
                                        <View style={styles.subjectInfo}>
                                            <Text style={styles.subjectName}>{subject.name}</Text>
                                            <Text style={styles.subjectMeta}>{subject.noteCount || 0} notes available</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="book-outline" size={48} color={colors.textLight} />
                                <Text style={styles.emptyTitle}>No subjects yet</Text>
                                <Text style={styles.emptyText}>Subjects for this semester haven't been added yet.</Text>
                            </View>
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
    subjectList: { gap: spacing.md },
    subjectCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    subjectIcon: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    subjectInfo: { flex: 1 },
    subjectName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    subjectMeta: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: spacing.md },
    emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    emptyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});
