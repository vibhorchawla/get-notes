import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useNotes } from '../../hooks/useNotes';
import { useDownloads } from '../../hooks/useDownloads';
import { useAuth } from '../../context/AuthContext';
import { openNote } from '../../utils/openNote';

const COURSE_TITLES: Record<string, string> = {
    'btech-cse': 'B.Tech CSE',
    'btech-me': 'B.Tech ME',
    'btech-ee': 'B.Tech EE',
    'bca': 'BCA',
    'mca': 'MCA',
    'diploma': 'Diploma',
    'bca-web': 'Full Stack Web Dev',
};

export default function NotesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { notes, isLoading } = useNotes(id);
    const { addDownload } = useDownloads();

    const now = new Date();
    const isPremium = user?.isPremium && user?.premiumEndDate ? new Date(user.premiumEndDate) > now : false;

    const handleNotePress = (noteId: string) => {
        const note = notes.find((n) => n.id === noteId);

        if (note?.isPremium && !isPremium) {
            Alert.alert(
                'Premium Note',
                'This note is only available for Premium members. Upgrade to access all premium notes.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go Premium', onPress: () => router.push('/(drawer)/subscription') },
                ]
            );
            return;
        }

        if (note?.pdfUrl) {
            router.push({
                pathname: `/note/${noteId}`,
                params: {
                    title: note.title,
                    pdfUrl: note.pdfUrl,
                    isPremium: note.isPremium ? 'true' : 'false',
                },
            });
        } else {
            console.warn('PDF URL missing for note:', noteId);
            Alert.alert('Error', 'PDF URL not found for this note.');
        }
    };

    const handleDownload = async (noteId: string) => {
        const note = notes.find((n) => n.id === noteId);
        if (note?.isPremium && !isPremium) {
            Alert.alert(
                'Premium Note',
                'Downloading premium notes requires a Premium subscription.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go Premium', onPress: () => router.push('/(drawer)/subscription') },
                ]
            );
            return;
        }
        await addDownload(noteId);
        Alert.alert('Downloaded', 'Note saved to your downloads!');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: COURSE_TITLES[id] || 'Course Notes',
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.white,
                }}
            />
            <GradientBackground>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Available Notes</Text>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                        ) : notes.length > 0 ? (
                            <View style={styles.notesList}>
                                {notes.map((note) => (
                                    <NoteItem
                                        key={note.id}
                                        title={note.title}
                                        subject={note.subject}
                                        unit={note.unit}
                                        isPremium={note.isPremium}
                                        onPress={() => handleNotePress(note.id)}
                                        onDownload={() => handleDownload(note.id)}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No notes available yet</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </GradientBackground>
        </>
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
        marginBottom: spacing.lg,
    },
    notesList: {
        marginBottom: spacing.lg,
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
