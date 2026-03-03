import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const DOWNLOADED_NOTES = [
    { id: '1', title: 'Object Oriented Programming Concepts', subject: 'OOP', unit: 'Unit 2' },
    { id: '2', title: 'Operating Systems - Process Management', subject: 'OS', unit: 'Unit 2' },
];

export default function DownloadsScreen() {
    return (
        <GradientBackground>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.title}>Downloads</Text>
                    <Text style={styles.subtitle}>Offline available notes</Text>

                    {DOWNLOADED_NOTES.length > 0 ? (
                        <View style={styles.notesList}>
                            {DOWNLOADED_NOTES.map((note) => (
                                <NoteItem
                                    key={note.id}
                                    title={note.title}
                                    subject={note.subject}
                                    unit={note.unit}
                                    onPress={() => { }}
                                    onDownload={() => { }}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No downloaded notes yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    notesList: {
        marginTop: spacing.md,
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
