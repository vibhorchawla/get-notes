import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import PersonalNoteCard from '../../components/PersonalNoteCard';
import SearchNoteCard from '../../components/SearchNoteCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import SearchBar from '../../components/SearchBar';
import TopHeader from '../../components/TopHeader';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { publishCommunityNote } from '../../hooks/useCommunityNotes';
import { useSaved } from '../../hooks/useSaved';
import { noteMatchesSearch, Note } from '../../types/note';
import { openNote } from '../../utils/openNote';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type NotesTab = 'all' | 'uploads' | 'saved';

export default function NotesScreen() {
    const router = useRouter();
    const { notes, isLoading, markPublished } = usePersonalNotes();
    const { savedNotes, isLoading: isSavedLoading } = useSaved();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<NotesTab>('all');

    const filteredUploads = useMemo(
        () => notes.filter((note) => noteMatchesSearch(note, searchQuery)),
        [notes, searchQuery]
    );

    const filteredSaved = useMemo(
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

    const showUploads = activeTab === 'all' || activeTab === 'uploads';
    const showSaved = activeTab === 'all' || activeTab === 'saved';

    const handleNotePress = (note: Note) => {
        openNote(router, note);
    };

    const handleAddPress = () => {
        router.push('/upload-note');
    };

    const handleShareNote = async (note: Note) => {
        const result = await publishCommunityNote(note);
        if (result.ok) {
            await markPublished(note.id);
            Alert.alert('Shared', 'Other students can now find this note in Home search.');
        } else {
            Alert.alert('Could not share', result.message || 'Try again after starting the server.');
        }
    };

    const renderHeader = () => (
        <View>
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search your uploads and saved notes..."
                />
            </View>

            <View style={styles.tabs}>
                {(['all', 'uploads', 'saved'] as NotesTab[]).map((tab) => {
                    const active = activeTab === tab;
                    const label = tab === 'all' ? 'All' : tab === 'uploads' ? 'My Uploads' : 'Saved';
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, active && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {activeTab === 'all' && showUploads && filteredUploads.length > 0 ? (
                <Text style={styles.sectionLabel}>
                    My Uploads{searchQuery.trim() ? ` (${filteredUploads.length})` : ''}
                </Text>
            ) : null}
        </View>
    );

    const listData = useMemo(() => {
        const items: Array<{ type: 'upload' | 'saved' | 'divider'; note?: Note; key: string }> = [];

        if (showUploads) {
            filteredUploads.forEach((note) => {
                items.push({ type: 'upload', note, key: `upload-${note.id}` });
            });
        }

        if (showUploads && showSaved && filteredUploads.length > 0 && filteredSaved.length > 0) {
            items.push({ type: 'divider', key: 'divider-saved' });
        }

        if (showSaved) {
            filteredSaved.forEach((note) => {
                items.push({
                    type: 'saved',
                    note: {
                        ...note,
                        content: note.content || '',
                        createdAt: '',
                        updatedAt: '',
                    } as Note,
                    key: `saved-${note.id}`,
                });
            });
        }

        return items;
    }, [filteredUploads, filteredSaved, showUploads, showSaved]);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="My Notes" />

                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.key}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        isLoading || isSavedLoading ? null : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery.trim()
                                        ? 'No uploaded or saved notes match your search.'
                                        : 'No notes yet. Upload with + or save notes from courses.'}
                                </Text>
                            </View>
                        )
                    }
                    renderItem={({ item, index }) => {
                        if (item.type === 'divider') {
                            return <Text style={styles.sectionLabel}>Saved Notes</Text>;
                        }

                        if (!item.note) return null;

                        if (item.type === 'saved') {
                            return (
                                <View style={styles.cardContainer}>
                                    <SearchNoteCard
                                        note={{ ...item.note, source: item.note.source || 'course' }}
                                        onPress={() => handleNotePress(item.note!)}
                                    />
                                </View>
                            );
                        }

                        return (
                            <View style={styles.cardContainer}>
                                <PersonalNoteCard
                                    note={item.note}
                                    index={index}
                                    onPress={() => handleNotePress(item.note!)}
                                    onShare={
                                        item.note!.isPublished
                                            ? undefined
                                            : () => handleShareNote(item.note!)
                                    }
                                />
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <FloatingActionButton onPress={handleAddPress} />
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
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.screenPadding,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.textOnPrimary,
    },
    sectionLabel: {
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    listContent: {
        paddingBottom: 100,
    },
    cardContainer: {
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.md,
    },
    emptyContainer: {
        marginTop: spacing.xxl,
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
