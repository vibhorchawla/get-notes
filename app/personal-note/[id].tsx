import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function PersonalNoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getNote } = usePersonalNotes();
    const note = getNote(id);

    const openLink = async (url?: string, label?: string) => {
        if (!url) return;

        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            Alert.alert('Cannot Open Link', `No app is available to open this ${label || 'link'}.`);
            return;
        }

        await Linking.openURL(url);
    };

    if (!note) {
        return (
            <GradientBackground>
                <Stack.Screen options={{ title: 'Note Details', headerShown: true }} />
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Note not found</Text>
                    <Text style={styles.emptyText}>This note may have been deleted or not saved correctly.</Text>
                </View>
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
                    <Text style={styles.title}>{note.title}</Text>
                    <Text style={styles.date}>Updated {new Date(note.updatedAt).toLocaleDateString()}</Text>

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
                        {note.playlistUrl ? (
                            <View style={styles.metaPill}>
                                <Text style={styles.metaPillText}>Playlist Added</Text>
                            </View>
                        ) : null}
                    </View>

                    <Text style={styles.body}>{note.content}</Text>

                    <View style={styles.actionGroup}>
                        {note.pdfUrl ? (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() =>
                                    router.push({
                                        pathname: `/note/${note.id}`,
                                        params: {
                                            title: note.title,
                                            pdfUrl: note.pdfUrl!,
                                        },
                                    })
                                }
                            >
                                <Ionicons name="document-text-outline" size={18} color={colors.textOnPrimary} />
                                <Text style={styles.primaryButtonText}>Open PDF</Text>
                            </TouchableOpacity>
                        ) : null}

                        {note.playlistUrl ? (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => openLink(note.playlistUrl, 'playlist')}
                            >
                                <Ionicons name="play-circle-outline" size={18} color={colors.primary} />
                                <Text style={styles.secondaryButtonText}>Open Playlist</Text>
                            </TouchableOpacity>
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
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
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
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    primaryButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
    secondaryButton: {
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
