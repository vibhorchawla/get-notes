import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const SAVED_NOTES = [
    { id: '1', title: 'Data Structures - Arrays & Linked Lists', subject: 'Data Structures', unit: 'Unit 1' },
    { id: '2', title: 'Algorithm Analysis & Complexity', subject: 'Algorithms', unit: 'Unit 1' },
    { id: '3', title: 'Database Management Systems - ER Model', subject: 'DBMS', unit: 'Unit 1' },
];

export default function SavedScreen() {
    return (
        <GradientBackground>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.title}>Saved Notes</Text>
                    <Text style={styles.subtitle}>Your bookmarked study materials</Text>

                    {SAVED_NOTES.length > 0 ? (
                        <View style={styles.notesList}>
                            {SAVED_NOTES.map((note) => (
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
                            <Text style={styles.emptyText}>No saved notes yet</Text>
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
