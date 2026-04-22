import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import PersonalNoteCard from '../../components/PersonalNoteCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import SearchBar from '../../components/SearchBar';
import TopHeader from '../../components/TopHeader';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function NotesScreen() {
    const router = useRouter();
    const { notes, isLoading } = usePersonalNotes();
    const [searchQuery, setSearchQuery] = useState('');

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredNotes = normalizedSearch
        ? notes.filter(
              (note) =>
                  note.title.toLowerCase().includes(normalizedSearch) ||
                  note.content.toLowerCase().includes(normalizedSearch)
          )
        : notes;

    const handleNotePress = (id: string) => {
        const note = notes.find((item) => item.id === id);
        const pdfUrl = note?.pdfUrl;

        if (note && pdfUrl) {
            router.push({
                pathname: `/note/${id}`,
                params: {
                    title: note.title,
                    pdfUrl,
                },
            });
            return;
        }

        router.push(`/personal-note/${id}`);
    };

    const handleAddPress = () => {
        router.push('/upload-note');
    };

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {searchQuery ? 'No uploaded notes match your search.' : 'No uploaded notes yet. Tap + to add one.'}
                </Text>
            </View>
        );
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="My Notes" />

                <View style={styles.searchContainer}>
                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                </View>

                <FlatList
                    data={filteredNotes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <View style={styles.cardContainer}>
                            <PersonalNoteCard note={item} index={index} onPress={() => handleNotePress(item.id)} />
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
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
    listContent: {
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: 100,
    },
    cardContainer: {
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
