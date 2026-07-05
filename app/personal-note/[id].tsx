import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function PersonalNoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getNote } = usePersonalNotes();
    const note = getNote(id);

    useEffect(() => {
        if (!note) return;

        if (note.pdfUrl) {
            const params: Record<string, string> = { title: note.title };
            const isLocal = note.pdfUrl.startsWith('file://') || note.pdfUrl.startsWith('content://');
            if (!isLocal) {
                params.pdfUrl = note.pdfUrl;
            }
            router.replace({
                pathname: `/note/${note.id}`,
                params,
            });
        }
    }, [note, router]);

    if (!note) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Note Details', headerShown: true }} />
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Note not found</Text>
                    <Text style={styles.emptyText}>This note may have been deleted or not saved correctly.</Text>
                </View>
            </View>
        );
    }

    if (note.pdfUrl) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: note.title, headerShown: true }} />
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Opening PDF...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: note.title, headerShown: true }} />
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{note.title}</Text>
                <Text style={styles.emptyText}>{note.content || 'No content'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
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
        textAlign: 'center',
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
