import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import SearchNoteCard from '../../components/SearchNoteCard';
import SearchBar from '../../components/SearchBar';
import TopHeader from '../../components/TopHeader';
import { noteMatchesSearch, Note } from '../../types/note';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useSaved } from '../../hooks/useSaved';

export default function SavedScreen() {
    const router = useRouter();
    const { savedNotes, isLoading, unsaveNote } = useSaved();
    const [searchQuery, setSearchQuery] = useState('');

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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                        ) : filteredNotes.length > 0 ? (
                            <View style={styles.notesList}>
                                {filteredNotes.map((note) => (
                                    <SearchNoteCard
                                        key={note.id}
                                        note={{
                                            ...note,
                                            content: note.content || '',
                                            createdAt: '',
                                            updatedAt: '',
                                            source: note.source || 'course',
                                        }}
                                        onPress={() =>
                                            openNote(router, {
                                                id: note.id,
                                                title: note.title,
                                                pdfUrl: note.pdfUrl,
                                                source: note.source || 'course',
                                            })
                                        }
                                        onRemove={() => unsaveNote(note.id)}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    {searchQuery.trim()
                                        ? 'No saved notes match your search.'
                                        : 'No saved notes yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
});
