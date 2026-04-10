import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import TopHeader from '../../components/TopHeader';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useDownloads } from '../../hooks/useDownloads';

export default function DownloadsScreen() {
    const { downloads, isLoading } = useDownloads();

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Downloads" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                    ) : downloads.length > 0 ? (
                        <View style={styles.notesList}>
                            {downloads.map((note) => (
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
