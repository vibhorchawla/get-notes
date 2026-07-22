import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import TopHeader from '../../components/TopHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { useDownloads } from '../../hooks/useDownloads';
import { useToast } from '../../context/ToastContext';

export default function DownloadsScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const { downloads, isLoading, addDownload, refetch, error } = useDownloads();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleNotePress = (note: typeof downloads[0]) => {
        if (note.pdfUrl) {
            router.push({
                pathname: `/note/${note.id}`,
                params: {
                    title: note.title,
                    pdfUrl: note.pdfUrl,
                    isPremium: note.isPremium ? 'true' : 'false',
                },
            });
        } else {
            showToast('This note has no PDF attached.', 'error');
        }
    };

    const handleDownload = async (noteId: string) => {
        const success = await addDownload(noteId);
        if (success) {
            showToast('Note re-downloaded.', 'success');
        } else {
            showToast('Download failed. Please try again.', 'error');
        }
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Downloads" />
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
                        ) : error && downloads.length === 0 ? (
                            <ErrorState
                                title="Could not load downloads"
                                message={error}
                                onRetry={refetch}
                                retryLabel="Retry"
                            />
                        ) : downloads.length > 0 ? (
                            <View style={styles.notesList}>
                                {downloads.map((note) => (
                                    <NoteItem
                                        key={note.id}
                                        title={note.title}
                                        subject={note.subject}
                                        unit={note.unit}
                                        isPremium={note.isPremium}
                                        onPress={() => handleNotePress(note)}
                                        onDownload={() => handleDownload(note.id)}
                                    />
                                ))}
                            </View>
                        ) : (
                            <EmptyState
                                icon="download-outline"
                                title="No downloads"
                                message="Notes you download will appear here for offline access."
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
