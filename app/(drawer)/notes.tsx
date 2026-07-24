import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import PersonalNoteCard from '../../components/PersonalNoteCard';
import SearchNoteCard from '../../components/SearchNoteCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import SearchBar from '../../components/SearchBar';
import TopHeader from '../../components/TopHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { publishCommunityNote } from '../../hooks/useCommunityNotes';
import { useSaved } from '../../hooks/useSaved';
import { noteMatchesSearch, Note } from '../../types/note';
import { openNote } from '../../utils/openNote';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type NotesTab = 'all' | 'uploads' | 'saved';
type SortOption = 'newest' | 'oldest' | 'title';

export default function NotesScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const { notes, isLoading, markPublished, loadNotes } = usePersonalNotes();
    const { savedNotes, isLoading: isSavedLoading, refetch: refetchSaved } = useSaved();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<NotesTab>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showSortPicker, setShowSortPicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadNotes(), refetchSaved()]);
        setRefreshing(false);
    }, [loadNotes, refetchSaved]);

    const sortNotes = useCallback(<T extends { title: string; updatedAt?: string; createdAt?: string }>(notesList: T[]): T[] => {
        const sorted = [...notesList];
        const parseDate = (d: string | undefined) => {
            const t = d ? new Date(d).getTime() : 0;
            return Number.isNaN(t) ? 0 : t;
        };
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => parseDate(b.updatedAt || b.createdAt) - parseDate(a.updatedAt || a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => parseDate(a.updatedAt || a.createdAt) - parseDate(b.updatedAt || b.createdAt));
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sorted;
        }
    }, [sortBy]);

    const filteredUploads = useMemo(
        () => sortNotes(notes.filter((note) => noteMatchesSearch(note, searchQuery))),
        [notes, searchQuery, sortNotes]
    );

    const filteredSaved = useMemo(
        () =>
            sortNotes(
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
                )
            ),
        [savedNotes, searchQuery, sortNotes]
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
            showToast('Note shared! Other students can find it in search.', 'success');
        } else {
            showToast(result.message || 'Could not share note.', 'error');
        }
    };

    const sortLabels: Record<SortOption, string> = { newest: 'Newest First', oldest: 'Oldest First', title: 'By Title' };

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

            <View style={styles.sortRow}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortPicker(!showSortPicker)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Sort by ${sortLabels[sortBy]}`}
                >
                    <Ionicons name="funnel-outline" size={16} color={colors.primary} />
                    <Text style={styles.sortButtonText}>{sortLabels[sortBy]}</Text>
                    <Ionicons name={showSortPicker ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
                </TouchableOpacity>
            </View>

            {showSortPicker && (
                <View style={styles.sortPicker}>
                    {(['newest', 'oldest', 'title'] as SortOption[]).map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.sortOption, sortBy === opt && styles.sortOptionActive]}
                            onPress={() => { setSortBy(opt); setShowSortPicker(false); }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={sortBy === opt ? 'radio-button-on' : 'radio-button-off'}
                                size={18}
                                color={sortBy === opt ? colors.primary : colors.textLight}
                            />
                            <Text style={[styles.sortOptionText, sortBy === opt && styles.sortOptionTextActive]}>
                                {sortLabels[opt]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

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
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        isLoading || isSavedLoading ? (
                            <View style={styles.skeletonWrap}>
                                <LoadingSkeleton.Card lines={3} />
                                <LoadingSkeleton.Card lines={3} />
                                <LoadingSkeleton.Card lines={2} />
                            </View>
                        ) : (
                            <EmptyState
                                icon="document-outline"
                                title={searchQuery.trim() ? 'No matching notes' : 'No notes yet'}
                                message={searchQuery.trim()
                                    ? 'No uploaded or saved notes match your search.'
                                    : 'Upload your first note with the + button or save notes from courses.'}
                                actionLabel="Upload Note"
                                onAction={() => router.push('/upload-note')}
                            />
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
                                        index={index}
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
    skeletonWrap: {
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.md,
    },
    sortRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        alignSelf: 'flex-start',
    },
    sortButtonText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    sortPicker: {
        marginHorizontal: spacing.screenPadding,
        marginBottom: spacing.md,
        backgroundColor: colors.cardBackground,
        borderRadius: 14,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: 10,
    },
    sortOptionActive: {
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    sortOptionText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    sortOptionTextActive: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
});
