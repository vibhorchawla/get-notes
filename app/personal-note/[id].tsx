import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

function extractPdfUrl(content: string): string | null {
    const match = content.match(/https?:\/\/\S+/i);
    return match ? match[0] : null;
}

export default function PersonalNoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getNote } = usePersonalNotes();
    const note = getNote(id);
    const pdfUrl = useMemo(() => (note ? extractPdfUrl(note.content) : null), [note]);

    const handleOpenPdf = async () => {
        if (!pdfUrl) {
            return;
        }

        const canOpen = await Linking.canOpenURL(pdfUrl);
        if (!canOpen) {
            Alert.alert('Cannot Open Link', 'No app is available to open this PDF link.');
            return;
        }

        await Linking.openURL(pdfUrl);
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
                    <Text style={styles.date}>
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.body}>{note.content}</Text>

                    {pdfUrl && (
                        <TouchableOpacity style={styles.button} onPress={handleOpenPdf}>
                            <Text style={styles.buttonText}>Open Attached PDF</Text>
                        </TouchableOpacity>
                    )}
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
        marginBottom: spacing.lg,
    },
    body: {
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    button: {
        marginTop: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.textOnPrimary,
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
