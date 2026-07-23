import React, { useState } from 'react';
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
import { useSubjectNotes } from '../../hooks/useSemesters';
import SearchNoteCard from '../../components/SearchNoteCard';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type SortOption = 'newest' | 'popular' | 'rating';

const SORT_OPTIONS: Array<{ key: SortOption; label: string }> = [
    { key: 'newest', label: 'Newest' },
    { key: 'popular', label: 'Most Popular' },
    { key: 'rating', label: 'Highest Rated' },
];

export default function SubjectScreen() {
    const { id, name, semester } = useLocalSearchParams<{ id: string; name: string; semester: string }>();
    const router = useRouter();
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const { notes, isLoading } = useSubjectNotes(id, sortBy);

    return (
        <>
            <Stack.Screen
                options={{
                    title: name || 'Subject Notes',
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.white,
                }}
            />
            <GradientBackground>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{name || 'Subject Notes'}</Text>
                            {semester ? <Text style={styles.subtitle}>Semester {semester}</Text> : null}
                        </View>
                    </View>

                    <View style={styles.sortRow}>
                        {SORT_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
                                onPress={() => setSortBy(opt.key)}
                            >
                                <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            {isLoading ? (
                                <View style={styles.skeletonWrap}>
                                    <LoadingSkeleton.Card lines={2} />
                                    <LoadingSkeleton.Card lines={2} />
                                    <LoadingSkeleton.Card lines={2} />
                                </View>
                            ) : notes.length > 0 ? (
                                notes.map((note, idx) => (
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
                                    title="No notes yet"
                                    message="Be the first to upload notes for this subject!"
                                    actionLabel="Upload Note"
                                    onAction={() => router.push('/upload-note')}
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>
            </GradientBackground>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerRow: { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.lg },
    headerInfo: { marginBottom: spacing.md },
    title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    sortRow: { flexDirection: 'row', paddingHorizontal: spacing.screenPadding, gap: spacing.sm, marginBottom: spacing.md },
    sortChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 999, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border },
    sortChipActive: { backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: colors.primary },
    sortChipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
    sortChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
    content: { padding: spacing.screenPadding, paddingTop: 0 },
    skeletonWrap: { paddingTop: spacing.md },
});
