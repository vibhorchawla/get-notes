import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { usePersonalNotes } from '../hooks/usePersonalNotes';
import { Note } from '../types/note';

type UploadMode = 'pdf' | 'playlist' | 'mixed';

const MODE_OPTIONS: Array<{
    mode: UploadMode;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}> = [
    {
        mode: 'pdf',
        title: 'PDF Notes',
        description: 'Upload notes that open directly as PDF.',
        icon: 'document-text-outline',
    },
    {
        mode: 'playlist',
        title: 'Playlist Notes',
        description: 'Save notes supported by a playlist link.',
        icon: 'play-circle-outline',
    },
    {
        mode: 'mixed',
        title: 'Both Together',
        description: 'Keep PDF notes and playlist references in one entry.',
        icon: 'albums-outline',
    },
];

function buildNotePayload(params: {
    title: string;
    subject: string;
    unit: string;
    pdfUrl: string;
    playlistUrl: string;
    details: string;
    uploadMode: UploadMode;
}): Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {
    const { title, subject, unit, pdfUrl, playlistUrl, details, uploadMode } = params;

    const sections = [
        subject ? `Subject: ${subject}` : null,
        unit ? `Unit: ${unit}` : null,
        pdfUrl ? `PDF Link: ${pdfUrl}` : null,
        playlistUrl ? `Playlist Link: ${playlistUrl}` : null,
        details ? `Details:\n${details}` : null,
    ].filter(Boolean);

    return {
        title,
        content: sections.join('\n\n'),
        subject: subject || undefined,
        unit: unit || undefined,
        pdfUrl: pdfUrl || undefined,
        playlistUrl: playlistUrl || undefined,
        noteType: uploadMode,
    };
}

export default function UploadNoteScreen() {
    const router = useRouter();
    const { addNote } = usePersonalNotes();
    const [uploadMode, setUploadMode] = useState<UploadMode>('pdf');
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [unit, setUnit] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [details, setDetails] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const modeTitle = useMemo(
        () => MODE_OPTIONS.find((option) => option.mode === uploadMode)?.title || 'Upload Notes',
        [uploadMode]
    );

    const requiresPdf = uploadMode === 'pdf' || uploadMode === 'mixed';
    const requiresPlaylist = uploadMode === 'playlist' || uploadMode === 'mixed';

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedSubject = subject.trim();
        const trimmedUnit = unit.trim();
        const trimmedPdfUrl = pdfUrl.trim();
        const trimmedPlaylistUrl = playlistUrl.trim();
        const trimmedDetails = details.trim();

        if (!trimmedTitle) {
            Alert.alert('Title Required', 'Please enter a note title before uploading.');
            return;
        }

        if (requiresPdf && !trimmedPdfUrl) {
            Alert.alert('PDF Link Required', 'Please add the PDF link for this note.');
            return;
        }

        if (requiresPlaylist && !trimmedPlaylistUrl) {
            Alert.alert('Playlist Link Required', 'Please add the playlist link for this note.');
            return;
        }

        if (!trimmedSubject && !trimmedDetails && !trimmedPdfUrl && !trimmedPlaylistUrl) {
            Alert.alert('Add Some Details', 'Please provide at least one useful detail for this note.');
            return;
        }

        try {
            setIsSaving(true);
            await addNote(
                buildNotePayload({
                    title: trimmedTitle,
                    subject: trimmedSubject,
                    unit: trimmedUnit,
                    pdfUrl: trimmedPdfUrl,
                    playlistUrl: trimmedPlaylistUrl,
                    details: trimmedDetails,
                    uploadMode,
                })
            );
            Alert.alert('Note Uploaded', `${modeTitle} has been added to My Notes.`, [
                {
                    text: 'Open My Notes',
                    onPress: () => router.replace('/notes'),
                },
            ]);
        } catch (error) {
            console.error('Upload note error:', error);
            Alert.alert('Upload Failed', 'Something went wrong while saving your note.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: 'Upload Notes',
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                }}
            />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroCard}>
                        <Text style={styles.heroTitle}>Upload notes with PDF or playlist support</Text>
                        <Text style={styles.heroSubtitle}>
                            Use the plus icon to add regular notes, playlist-based notes, or both together in one place.
                        </Text>
                    </View>

                    <View style={styles.modeGrid}>
                        {MODE_OPTIONS.map((option) => {
                            const active = uploadMode === option.mode;
                            return (
                                <TouchableOpacity
                                    key={option.mode}
                                    style={[styles.modeCard, active && styles.modeCardActive]}
                                    onPress={() => setUploadMode(option.mode)}
                                >
                                    <View style={[styles.modeIconWrap, active && styles.modeIconWrapActive]}>
                                        <Ionicons
                                            name={option.icon}
                                            size={20}
                                            color={active ? colors.textOnPrimary : colors.primary}
                                        />
                                    </View>
                                    <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{option.title}</Text>
                                    <Text style={[styles.modeDescription, active && styles.modeDescriptionActive]}>
                                        {option.description}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.label}>Note Title</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. DBMS Unit 2 Notes"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="e.g. Database Management Systems"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Unit or Module</Text>
                        <TextInput
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="e.g. Unit 2"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        <Text style={styles.label}>
                            PDF Link {requiresPdf ? '(Required)' : '(Optional)'}
                        </Text>
                        <TextInput
                            value={pdfUrl}
                            onChangeText={setPdfUrl}
                            placeholder="https://example.com/your-note.pdf"
                            placeholderTextColor={colors.textLight}
                            autoCapitalize="none"
                            keyboardType="url"
                            style={styles.input}
                        />

                        <Text style={styles.label}>
                            Playlist Link {requiresPlaylist ? '(Required)' : '(Optional)'}
                        </Text>
                        <TextInput
                            value={playlistUrl}
                            onChangeText={setPlaylistUrl}
                            placeholder="https://youtube.com/playlist?list=..."
                            placeholderTextColor={colors.textLight}
                            autoCapitalize="none"
                            keyboardType="url"
                            style={styles.input}
                        />

                        <Text style={styles.label}>Extra Details</Text>
                        <TextInput
                            value={details}
                            onChangeText={setDetails}
                            placeholder="Add topics covered, revision tips, or a short summary."
                            placeholderTextColor={colors.textLight}
                            multiline
                            textAlignVertical="top"
                            style={[styles.input, styles.textArea]}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSaving}
                        >
                            <Text style={styles.submitButtonText}>{isSaving ? 'Saving...' : `Save ${modeTitle}`}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    content: {
        padding: spacing.screenPadding,
        paddingBottom: spacing.xxl,
        gap: spacing.lg,
    },
    heroCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    heroTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    modeGrid: {
        gap: spacing.sm,
    },
    modeCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modeCardActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    modeIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    modeIconWrapActive: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    modeTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    modeTitleActive: {
        color: colors.textOnPrimary,
    },
    modeDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    modeDescriptionActive: {
        color: 'rgba(255,255,255,0.82)',
    },
    formCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
    textArea: {
        minHeight: 140,
    },
    submitButton: {
        marginTop: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
});
