import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import SearchNoteCard from '../../components/SearchNoteCard';
import TopHeader from '../../components/TopHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { openNote } from '../../utils/openNote';

export default function MyUploadsScreen() {
    const router = useRouter();
    const { notes, isLoading, loadNotes } = usePersonalNotes();
    const [refreshing, setRefreshing] = useState(false);

    const uploadedNotes = notes.filter((n) => n.isPublished === true);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadNotes();
        setRefreshing(false);
    }, [loadNotes]);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="My Uploads" />
                <Animated.View entering={FadeInDown.delay(100).springify().damping(14)} style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <View style={styles.content}>
                        {isLoading && !refreshing ? (
                            <View style={styles.skeletonWrap}>
                                <LoadingSkeleton.Card lines={2} />
                                <LoadingSkeleton.Card lines={2} />
                                <LoadingSkeleton.Card lines={2} />
                            </View>
                        ) : uploadedNotes.length > 0 ? (
                            <View style={styles.notesList}>
                                {uploadedNotes.map((note, idx) => (
                                    <SearchNoteCard
                                        key={note.id}
                                        note={note}
                                        index={idx}
                                        onPress={() => openNote(router, note)}
                                        onUploaderPress={() => (note.uploaderId || note.uploadedBy?.id) ? router.push(`/contributor/${note.uploaderId || note.uploadedBy?.id}`) : undefined}
                                    />
                                ))}
                            </View>
                        ) : (
                            <EmptyState
                                icon="cloud-upload-outline"
                                title="No uploads yet"
                                message="Notes you upload will appear here. Tap + to share your first note."
                                actionLabel="Upload Note"
                                onAction={() => router.push('/upload-note')}
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
    content: {
        padding: spacing.screenPadding,
    },
    notesList: {
        marginTop: spacing.md,
    },
    skeletonWrap: {
        paddingTop: spacing.md,
    },
});
