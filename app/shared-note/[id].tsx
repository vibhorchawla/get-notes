import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/Button';
import { apiFetch } from '../../hooks/useApi';
import { Note } from '../../types/note';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { openNote } from '../../utils/openNote';

export default function SharedNoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNote = async () => {
            try {
                let res = await apiFetch<Note>(`/note/${id}`, { requiresAuth: false });
                if (!res.success) {
                    res = await apiFetch<Note>(`/notes/item/${id}`, { requiresAuth: false });
                }
                if (res.success && res.data) {
                    setNote(res.data);
                }
            } catch (error) {
                console.error('Shared note load error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadNote();
    }, [id]);

    const openLink = async (url?: string, label?: string) => {
        if (!url) return;
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            Alert.alert('Cannot Open Link', `No app is available to open this ${label || 'link'}.`);
            return;
        }
        await Linking.openURL(url);
    };

    if (isLoading) {
        return (
            <GradientBackground>
                <Stack.Screen options={{ title: 'Note', headerShown: true }} />
                <View style={styles.centered}>
                    <LoadingSkeleton.ProfileHeader />
                </View>
            </GradientBackground>
        );
    }

    if (!note) {
        return (
            <GradientBackground>
                <Stack.Screen options={{ title: 'Note', headerShown: true }} />
                <ErrorState
                    title="Note not found"
                    message="This shared note could not be loaded. It may have been removed or the link is invalid."
                />
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: note.title,
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {note.uploadedBy?.name ? (
                        <View style={styles.uploaderCard}>
                            <View style={styles.uploaderRow}>
                                <View style={styles.uploaderAvatar}>
                                    <Text style={styles.uploaderAvatarText}>{note.uploadedBy.name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.uploaderInfo}>
                                    <Text style={styles.uploaderName}>{note.uploadedBy.name}</Text>
                                    {note.uploadedBy.college ? (
                                        <Text style={styles.uploaderCollege}>{note.uploadedBy.college}</Text>
                                    ) : null}
                                </View>
                                {note.uploadedBy.id && (
                                    <View style={styles.contributorBadge}>
                                        <Ionicons name="ribbon-outline" size={12} color={colors.primary} />
                                        <Text style={styles.contributorBadgeText}>Contributor</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.uploaderMeta}>
                                {note.uploadedBy.branch ? (
                                    <View style={styles.uploaderMetaItem}>
                                        <Ionicons name="git-branch-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.uploaderMetaText}>{note.uploadedBy.branch}</Text>
                                    </View>
                                ) : null}
                                {note.createdAt ? (
                                    <View style={styles.uploaderMetaItem}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.uploaderMetaText}>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    ) : null}
                    <Text style={styles.title}>{note.title}</Text>

                    <View style={styles.metaWrap}>
                        {note.subject ? (
                            <View style={styles.metaPill}>
                                <Text style={styles.metaPillText}>{note.subject}</Text>
                            </View>
                        ) : null}
                        {note.unit ? (
                            <View style={styles.metaPill}>
                                <Text style={styles.metaPillText}>{note.unit}</Text>
                            </View>
                        ) : null}
                    </View>

                    <Text style={styles.body}>{note.content}</Text>

                    <View style={styles.actionGroup}>
                        {note.pdfUrl ? (
                            <Button
                                title="Open PDF"
                                onPress={() => openNote(router, note)}
                                icon="document-text-outline"
                                fullWidth
                            />
                        ) : null}
                        {note.playlistUrl ? (
                            <Button
                                title="Open Playlist"
                                onPress={() => openLink(note.playlistUrl, 'playlist')}
                                variant="secondary"
                                icon="play-circle-outline"
                                fullWidth
                            />
                        ) : null}
                    </View>
                </View>
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.screenPadding,
        paddingBottom: spacing.xxl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    uploaderCard: {
        backgroundColor: colors.cardBackground, borderRadius: 12, padding: spacing.md,
        marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    uploaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    uploaderAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    uploaderAvatarText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: '#FFFFFF' },
    uploaderInfo: { flex: 1 },
    uploaderName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    uploaderCollege: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    contributorBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 999,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    contributorBadgeText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold },
    uploaderMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    uploaderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    uploaderMetaText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    metaWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.lg,
    },
    metaPill: {
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    metaPillText: {
        color: colors.primary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
    body: {
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    actionGroup: {
        marginTop: spacing.xl,
        gap: spacing.sm,
    },
});
