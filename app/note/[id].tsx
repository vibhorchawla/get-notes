import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PdfViewer from '../../components/PdfViewer';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { useSaved } from '../../hooks/useSaved';
import { useDownloads } from '../../hooks/useDownloads';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { normalizePdfUrl } from '../../utils/localFile';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

export default function NoteViewer() {
    const { id, title, pdfUrl: paramPdfUrl, isPremium } = useLocalSearchParams<{
        id: string;
        title: string;
        pdfUrl?: string;
        isPremium?: string;
    }>();

    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { getNote } = usePersonalNotes();
    const { savedNotes, saveNote, unsaveNote } = useSaved();
    const { addDownload } = useDownloads();

    const now = new Date();
    const userIsPremium = user?.isPremium && user?.premiumEndDate ? new Date(user.premiumEndDate) > now : false;
    const noteIsPremium = isPremium === 'true';

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
            showToast('Bookmark removed.', 'info');
        } else {
            await saveNote(id);
            showToast('Note saved to bookmarks!', 'success');
        }
    };

    const handleDownload = async () => {
        if (noteIsPremium && !userIsPremium) {
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
        await addDownload(id);
        showToast('Download started!', 'success');
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

            {noteIsPremium && !userIsPremium ? (
                <View style={styles.premiumLock}>
                    <Ionicons name="lock-closed" size={64} color="#7C3AED" />
                    <Text style={styles.premiumLockTitle}>Premium Note</Text>
                    <Text style={styles.premiumLockSub}>
                        Upgrade to Premium to access this note and many more.
                    </Text>
                    <TouchableOpacity
                        style={styles.premiumLockBtn}
                        onPress={() => router.push('/(drawer)/subscription')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="diamond" size={18} color="#FFFFFF" />
                        <Text style={styles.premiumLockBtnText}>Go Premium</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <PdfViewer pdfUrl={resolvedPdfUrl} />
            )}
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
    premiumLock: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
    },
    premiumLockTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    premiumLockSub: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 20,
    },
    premiumLockBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#7C3AED',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: spacing.md,
    },
    premiumLockBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
