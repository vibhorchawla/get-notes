import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import SearchNoteCard from '../../components/SearchNoteCard';
import SearchBar from '../../components/SearchBar';
import TopHeader from '../../components/TopHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { noteMatchesSearch, Note } from '../../types/note';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { useSaved } from '../../hooks/useSaved';

export default function SavedScreen() {
    const router = useRouter();
    const { savedNotes, isLoading, unsaveNote, refetch } = useSaved();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const filteredNotes = useMemo(
        () =>
            savedNotes.filter((note) =>
                noteMatchesSearch(
                    {
                        ...note,
                        content: note.content || '',
                        createdAt: '',
                        updatedAt: '',
                    } as Note,
                    searchQuery
                )
            ),
        [savedNotes, searchQuery]
    );

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Saved Notes" />
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search saved notes..."
                    />
                </View>
                <Animated.View entering={FadeInDown.delay(100).springify().damping(14)} style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <View style={styles.content}>
                        {isLoading ? (
                            <View style={styles.skeletonWrap}>
                                <LoadingSkeleton.Card lines={2} />
                                <LoadingSkeleton.Card lines={2} />
                                <LoadingSkeleton.Card lines={2} />
                            </View>
                        ) : filteredNotes.length > 0 ? (
                            <View style={styles.notesList}>
                                {filteredNotes.map((note, idx) => (
                                    <SearchNoteCard
                                        key={note.id}
                                        note={{
                                            ...note,
                                            content: note.content || '',
                                            createdAt: '',
                                            updatedAt: '',
                                            source: note.source || 'course',
                                        }}
                                        index={idx}
                                        onPress={() =>
                                            openNote(router, {
                                                id: note.id,
                                                title: note.title,
                                                pdfUrl: note.pdfUrl,
                                                source: note.source || 'course',
                                                isPremium: note.isPremium,
                                            })
                                        }
                                        onRemove={() => unsaveNote(note.id)}
                                    />
                                ))}
                            </View>
                        ) : (
                            <EmptyState
                                icon="bookmark-outline"
                                title={searchQuery.trim() ? 'No matching saved notes' : 'No saved notes'}
                                message={searchQuery.trim()
                                    ? 'No saved notes match your search query.'
                                    : 'Notes you save from courses will appear here.'}
                                actionLabel="Browse Courses"
                                onAction={() => router.push('/')}
                            />
                        )}
                    </View>
                </ScrollView>
                </Animated.View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.sm,
    },
    content: {
        padding: spacing.screenPadding,
        paddingTop: 0,
    },
    notesList: {
        marginTop: spacing.sm,
    },
    skeletonWrap: {
        paddingTop: spacing.md,
    },
});
