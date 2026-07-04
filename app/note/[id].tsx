import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PdfViewer from '../../components/PdfViewer';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { useSaved } from '../../hooks/useSaved';
import { useDownloads } from '../../hooks/useDownloads';
import { normalizePdfUrl } from '../../utils/localFile';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export default function NoteViewer() {
    const { id, title, pdfUrl: paramPdfUrl } = useLocalSearchParams<{
        id: string;
        title: string;
        pdfUrl?: string;
    }>();

    const { getNote } = usePersonalNotes();
    const { savedNotes, saveNote, unsaveNote } = useSaved();
    const { addDownload } = useDownloads();

    const storedNote = getNote(id);
    const savedNote = savedNotes.find((n) => n.id === id);

    const resolvedTitle = title || storedNote?.title || savedNote?.title || 'Note';
    const resolvedPdfUrl = useMemo(() => {
        const fromStore = storedNote?.pdfUrl || savedNote?.pdfUrl;
        return normalizePdfUrl(fromStore || paramPdfUrl || '');
    }, [storedNote?.pdfUrl, savedNote?.pdfUrl, paramPdfUrl]);

    const isSaved = savedNotes.some((n) => n.id === id);

    const handleSave = async () => {
        if (isSaved) {
            await unsaveNote(id);
            Alert.alert('Bookmark Removed', 'Note removed from your saved list.');
        } else {
            await saveNote(id);
            Alert.alert('Bookmark Added', 'Note saved to your bookmarks!');
        }
    };

    const handleDownload = async () => {
        await addDownload(id);
        Alert.alert('Download Started', 'The PDF is being saved to your downloads.');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: resolvedTitle,
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                                <Ionicons
                                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                    size={22}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
                                <Ionicons name="download-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <PdfViewer pdfUrl={resolvedPdfUrl} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    headerButton: {
        padding: spacing.sm,
        marginLeft: spacing.xs,
    },
});
