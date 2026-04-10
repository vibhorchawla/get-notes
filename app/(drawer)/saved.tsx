import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import TopHeader from '../../components/TopHeader';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useSaved } from '../../hooks/useSaved';

export default function SavedScreen() {
    const { savedNotes, isLoading, unsaveNote } = useSaved();

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Saved Notes" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                    ) : savedNotes.length > 0 ? (
                        <View style={styles.notesList}>
                            {savedNotes.map((note) => (
                                <NoteItem
                                    key={note.id}
                                    title={note.title}
                                    subject={note.subject}
                                    unit={note.unit}
                                    onPress={() => { }}
                                    onDownload={() => unsaveNote(note.id)}
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
