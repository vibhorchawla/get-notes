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
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { usePersonalNotes } from '../hooks/usePersonalNotes';
import { useAuth } from '../context/AuthContext';
import { publishCommunityNote } from '../hooks/useCommunityNotes';
import { Note } from '../types/note';
import DriveFilePickerModal from '../components/DriveFilePickerModal';
import { PickedDriveFile, uploadFileToServer } from '../hooks/useDriveFiles';

type UploadMode = 'drive' | 'playlist' | 'mixed';

const MODE_OPTIONS: Array<{
    mode: UploadMode;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    accent: string;
}> = [
    {
        mode: 'drive',
        title: 'Drive',
        subtitle: 'Google Drive file',
        icon: 'logo-google',
        accent: '#4285F4',
    },
    {
        mode: 'playlist',
        title: 'Playlist',
        subtitle: 'YouTube playlist',
        icon: 'play-circle-outline',
        accent: colors.secondary,
    },
    {
        mode: 'mixed',
        title: 'Both',
        subtitle: 'Drive + playlist',
        icon: 'layers-outline',
        accent: colors.primary,
    },
];

function buildNotePayload(params: {
    title: string;
    subject: string;
    unit: string;
    pickedFile: PickedDriveFile | null;
    playlistUrl: string;
    details: string;
    uploadMode: UploadMode;
}): Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {
    const { title, subject, unit, pickedFile, playlistUrl, details, uploadMode } = params;
    const viewUrl =
        pickedFile?.uploadedUrl || pickedFile?.viewUrl || pickedFile?.shareUrl || undefined;
    const shareLabel = pickedFile?.shareUrl || pickedFile?.uploadedUrl;

    const sections = [
        subject ? `Subject: ${subject}` : null,
        unit ? `Unit: ${unit}` : null,
        pickedFile?.name ? `File: ${pickedFile.name}` : null,
        shareLabel ? `Drive Link: ${shareLabel}` : null,
        playlistUrl ? `Playlist Link: ${playlistUrl}` : null,
        details ? `Details:\n${details}` : null,
    ].filter(Boolean);

    return {
        title,
        content: sections.join('\n\n'),
        subject: subject || undefined,
        unit: unit || undefined,
        pdfUrl: viewUrl,
        playlistUrl: playlistUrl || undefined,
        noteType: uploadMode === 'drive' ? 'drive' : uploadMode,
    };
}

function FieldLabel({
    icon,
    label,
    required,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    required?: boolean;
}) {
    return (
        <View style={fieldStyles.labelRow}>
            <View style={fieldStyles.labelIcon}>
                <Ionicons name={icon} size={14} color={colors.primary} />
            </View>
            <Text style={fieldStyles.label}>
                {label}
                {required ? <Text style={fieldStyles.required}> *</Text> : null}
            </Text>
        </View>
    );
}

const fieldStyles = StyleSheet.create({
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    labelIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    required: {
        color: colors.error,
    },
});

export default function UploadNoteScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { addNote, markPublished } = usePersonalNotes();
    const [uploadMode, setUploadMode] = useState<UploadMode>('drive');
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [unit, setUnit] = useState('');
    const [pickedFile, setPickedFile] = useState<PickedDriveFile | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [details, setDetails] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const modeTitle = useMemo(
        () => MODE_OPTIONS.find((option) => option.mode === uploadMode)?.title || 'Upload Notes',
        [uploadMode]
    );

    const requiresDrive = uploadMode === 'drive' || uploadMode === 'mixed';
    const requiresPlaylist = uploadMode === 'playlist' || uploadMode === 'mixed';

    const handleFileSelected = (file: PickedDriveFile) => {
        setPickedFile(file);
        if (!title.trim()) {
            const baseName = file.name.replace(/\.[^.]+$/, '');
            setTitle(baseName);
        }
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedSubject = subject.trim();
        const trimmedUnit = unit.trim();
        const trimmedPlaylistUrl = playlistUrl.trim();
        const trimmedDetails = details.trim();

        if (!trimmedTitle) {
            Alert.alert('Title Required', 'Please enter a note title before uploading.');
            return;
        }

        if (requiresDrive && !pickedFile) {
            Alert.alert('Select a File', 'Tap "Add from Google Drive" and choose a file.');
            return;
        }

        if (requiresPlaylist && !trimmedPlaylistUrl) {
            Alert.alert('Playlist Link Required', 'Please add the playlist link for this note.');
            return;
        }

        if (!trimmedSubject && !trimmedDetails && !pickedFile && !trimmedPlaylistUrl) {
            Alert.alert('Add Some Details', 'Please provide at least one useful detail for this note.');
            return;
        }

        try {
            setIsSaving(true);
            let fileForNote = pickedFile;

            let uploadWarning: string | null = null;

            if (user && fileForNote?.uri && !fileForNote.uploadedUrl) {
                setIsUploadingFile(true);
                const uploaded = await uploadFileToServer(fileForNote.uri, fileForNote.name);
                setIsUploadingFile(false);

                if (uploaded.ok) {
                    fileForNote = {
                        ...fileForNote,
                        uploadedUrl: uploaded.url,
                        viewUrl: uploaded.url,
                        shareUrl: uploaded.url,
                    };
                } else {
                    uploadWarning = uploaded.message;
                }
            }

            const newNote = await addNote(
                buildNotePayload({
                    title: trimmedTitle,
                    subject: trimmedSubject,
                    unit: trimmedUnit,
                    pickedFile: fileForNote,
                    playlistUrl: trimmedPlaylistUrl,
                    details: trimmedDetails,
                    uploadMode,
                })
            );

            setIsSaving(false);

            if (!user) {
                Alert.alert(
                    'Note Saved Locally',
                    'Your file is saved on this device. Sign in to share it with other students.',
                    [{ text: 'OK', onPress: () => router.replace('/notes') }]
                );
                return;
            }

            if (uploadWarning) {
                Alert.alert('Saved Locally', `Note saved, but file upload failed:\n\n${uploadWarning}`, [
                    { text: 'OK', onPress: () => router.replace('/notes') },
                ]);
                return;
            }

            const publishResult = await publishCommunityNote(newNote);
            if (publishResult.ok) {
                await markPublished(newNote.id);
            }

            Alert.alert(
                publishResult.ok ? 'Note Uploaded' : 'Saved Locally',
                publishResult.ok
                    ? `${modeTitle} is shared. Other students can find it on Home search.`
                    : `${modeTitle} is saved on this device only.\n\n${publishResult.message || 'Sharing failed.'}`,
                [{ text: 'Open My Notes', onPress: () => router.replace('/notes') }]
            );
        } catch (error) {
            console.error('Upload note error:', error);
            Alert.alert('Upload Failed', 'Something went wrong while saving your note.');
        } finally {
            setIsSaving(false);
            setIsUploadingFile(false);
        }
    };

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: 'Upload Notes',
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.gradientStart },
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                }}
            />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        colors={['#7C3AED', '#6D28D9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroIconWrap}>
                            <Ionicons name="cloud-upload-outline" size={28} color={colors.textOnPrimary} />
                        </View>
                        <Text style={styles.heroTitle}>Share your notes</Text>
                        <Text style={styles.heroSubtitle}>
                            Add from Google Drive so classmates can search and open your notes.
                        </Text>
                    </LinearGradient>

                    <Text style={styles.sectionHeading}>Choose type</Text>
                    <View style={styles.modeRow}>
                        {MODE_OPTIONS.map((option) => {
                            const active = uploadMode === option.mode;
                            return (
                                <TouchableOpacity
                                    key={option.mode}
                                    style={[styles.modeChip, active && styles.modeChipActive]}
                                    onPress={() => setUploadMode(option.mode)}
                                    activeOpacity={0.85}
                                >
                                    <View
                                        style={[
                                            styles.modeChipIcon,
                                            { backgroundColor: active ? 'rgba(255,255,255,0.2)' : `${option.accent}18` },
                                        ]}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={20}
                                            color={active ? colors.textOnPrimary : option.accent}
                                        />
                                    </View>
                                    <Text style={[styles.modeChipTitle, active && styles.modeChipTitleActive]}>
                                        {option.title}
                                    </Text>
                                    <Text style={[styles.modeChipSub, active && styles.modeChipSubActive]}>
                                        {option.subtitle}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.formHeading}>Note details</Text>

                        <FieldLabel icon="document-text-outline" label="Title" required />
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. DBMS Unit 2 Notes"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        <FieldLabel icon="school-outline" label="Subject" />
                        <TextInput
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="e.g. Database Management Systems"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        <FieldLabel icon="bookmark-outline" label="Unit or module" />
                        <TextInput
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="e.g. Unit 2"
                            placeholderTextColor={colors.textLight}
                            style={styles.input}
                        />

                        {requiresDrive ? (
                            <View style={styles.driveCard}>
                                <FieldLabel icon="logo-google" label="Google Drive file" required />

                                {pickedFile ? (
                                    <View style={styles.selectedFileCard}>
                                        <View style={styles.selectedFileIcon}>
                                            <Ionicons name="document-text" size={22} color={colors.primary} />
                                        </View>
                                        <View style={styles.selectedFileInfo}>
                                            <Text style={styles.selectedFileName} numberOfLines={2}>
                                                {pickedFile.name}
                                            </Text>
                                            <Text style={styles.selectedFileMeta}>Ready to upload</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setPickedFile(null)}
                                            hitSlop={8}
                                        >
                                            <Ionicons name="close-circle" size={22} color={colors.textLight} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.driveButton}
                                        onPress={() => setPickerVisible(true)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="logo-google" size={22} color={colors.primary} />
                                        <Text style={styles.driveButtonText}>Add from Google Drive</Text>
                                    </TouchableOpacity>
                                )}

                                {pickedFile ? (
                                    <TouchableOpacity
                                        style={styles.changeFileBtn}
                                        onPress={() => setPickerVisible(true)}
                                    >
                                        <Text style={styles.changeFileText}>Choose a different file</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        ) : null}

                        {requiresPlaylist ? (
                            <>
                                <FieldLabel icon="play-circle-outline" label="Playlist link" required />
                                <TextInput
                                    value={playlistUrl}
                                    onChangeText={setPlaylistUrl}
                                    placeholder="https://youtube.com/playlist?list=..."
                                    placeholderTextColor={colors.textLight}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                    style={styles.input}
                                />
                            </>
                        ) : null}

                        <FieldLabel icon="create-outline" label="Extra details" />
                        <TextInput
                            value={details}
                            onChangeText={setDetails}
                            placeholder="Topics covered, revision tips, or a short summary..."
                            placeholderTextColor={colors.textLight}
                            multiline
                            textAlignVertical="top"
                            style={[styles.input, styles.textArea]}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSaving}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="checkmark-circle-outline" size={22} color={colors.textOnPrimary} />
                            <Text style={styles.submitButtonText}>
                                {isSaving
                                    ? isUploadingFile
                                        ? 'Uploading file...'
                                        : 'Saving...'
                                    : `Save & share ${modeTitle}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <DriveFilePickerModal
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleFileSelected}
            />
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
    },
    heroCard: {
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    heroIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textOnPrimary,
        marginBottom: spacing.xs,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.88)',
        lineHeight: 22,
    },
    sectionHeading: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.sm,
    },
    modeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    modeChip: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 18,
        padding: spacing.sm,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    modeChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    modeChipIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    modeChipTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    modeChipTitleActive: {
        color: colors.textOnPrimary,
    },
    modeChipSub: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    modeChipSubActive: {
        color: 'rgba(255,255,255,0.75)',
    },
    formCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    formHeading: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: typography.fontSize.md,
    },
    driveCard: {
        marginTop: spacing.sm,
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        borderRadius: 18,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    driveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(124, 58, 237, 0.12)',
        borderRadius: 14,
        paddingVertical: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(124, 58, 237, 0.35)',
        borderStyle: 'dashed',
    },
    driveButtonText: {
        color: '#7C3AED',
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
    selectedFileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    selectedFileIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedFileInfo: {
        flex: 1,
    },
    selectedFileName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    selectedFileMeta: {
        fontSize: typography.fontSize.xs,
        color: colors.accent,
        marginTop: 2,
        fontWeight: typography.fontWeight.medium,
    },
    changeFileBtn: {
        marginTop: spacing.sm,
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    changeFileText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    textArea: {
        minHeight: 120,
    },
    submitButton: {
        marginTop: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
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
