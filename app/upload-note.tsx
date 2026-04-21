import React, { useState } from 'react';
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
import GradientBackground from '../components/GradientBackground';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { usePersonalNotes } from '../hooks/usePersonalNotes';

export default function UploadNoteScreen() {
    const router = useRouter();
    const { addNote } = usePersonalNotes();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [unit, setUnit] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [details, setDetails] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedSubject = subject.trim();
        const trimmedUnit = unit.trim();
        const trimmedPdfUrl = pdfUrl.trim();
        const trimmedDetails = details.trim();

        if (!trimmedTitle) {
            Alert.alert('Title Required', 'Please enter a note title before uploading.');
            return;
        }

        if (!trimmedSubject && !trimmedPdfUrl && !trimmedDetails) {
            Alert.alert('Add Some Note Details', 'Please provide a subject, PDF link, or some note details.');
            return;
        }

        const sections = [
            trimmedSubject ? `Subject: ${trimmedSubject}` : null,
            trimmedUnit ? `Unit: ${trimmedUnit}` : null,
            trimmedPdfUrl ? `PDF Link: ${trimmedPdfUrl}` : null,
            trimmedDetails ? `Details:\n${trimmedDetails}` : null,
        ].filter(Boolean);

        try {
            setIsSaving(true);
            await addNote(trimmedTitle, sections.join('\n\n'));
            Alert.alert('Note Uploaded', 'Your note has been added to My Notes.', [
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

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroCard}>
                        <Text style={styles.heroTitle}>Upload your notes</Text>
                        <Text style={styles.heroSubtitle}>
                            Add a title, optional PDF link, and any extra details so your notes are easy to find later.
                        </Text>
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

                        <Text style={styles.label}>PDF Link</Text>
                        <TextInput
                            value={pdfUrl}
                            onChangeText={setPdfUrl}
                            placeholder="https://example.com/your-note.pdf"
                            placeholderTextColor={colors.textLight}
                            autoCapitalize="none"
                            keyboardType="url"
                            style={styles.input}
                        />

                        <Text style={styles.label}>Extra Details</Text>
                        <TextInput
                            value={details}
                            onChangeText={setDetails}
                            placeholder="Add a short summary, topics covered, or any helpful notes."
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
                            <Text style={styles.submitButtonText}>
                                {isSaving ? 'Saving...' : 'Upload Note'}
                            </Text>
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
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
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
