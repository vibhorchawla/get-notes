import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
    Linking,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

// Only import native PDF if NOT in Expo Go to avoid crashes.
let Pdf: any = null;
try {
    if (Constants.appOwnership !== 'expo') {
        Pdf = require('react-native-pdf').default;
    }
} catch (error) {
    console.log('Native PDF module not found, falling back to WebView');
}

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useSaved } from '../../hooks/useSaved';
import { useDownloads } from '../../hooks/useDownloads';

type ViewerMode = 'native' | 'direct-web' | 'google-viewer';

function normalizePdfUrl(pdfUrl?: string | string[]): string {
    const value = Array.isArray(pdfUrl) ? pdfUrl[0] : pdfUrl;
    if (!value) return '';

    // Android preview services are much happier with https.
    if (value.startsWith('http://')) {
        return value.replace('http://', 'https://');
    }

    return value;
}

function getViewerSource(mode: ViewerMode, pdfUrl: string) {
    if (mode === 'google-viewer') {
        return {
            uri: `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`,
        };
    }

    return { uri: pdfUrl };
}

export default function NoteViewer() {
    const { id, title, pdfUrl } = useLocalSearchParams<{
        id: string;
        title: string;
        pdfUrl: string;
    }>();

    const normalizedPdfUrl = useMemo(() => normalizePdfUrl(pdfUrl), [pdfUrl]);
    const isExpoGo = Constants.appOwnership === 'expo';
    const prefersEmbeddedViewer = isExpoGo;
    const [isLoading, setIsLoading] = useState(true);
    const [viewerMode, setViewerMode] = useState<ViewerMode>(
        prefersEmbeddedViewer ? 'google-viewer' : 'direct-web'
    );
    const [viewerError, setViewerError] = useState<string | null>(null);
    const { savedNotes, saveNote, unsaveNote } = useSaved();
    const { addDownload } = useDownloads();

    const isSaved = savedNotes.some((n) => n.id === id);
    const canUseNativePdf = Boolean(Pdf && !isExpoGo && normalizedPdfUrl);
    const webSource = getViewerSource(viewerMode, normalizedPdfUrl);

    useEffect(() => {
        setIsLoading(true);
        setViewerError(null);
        setViewerMode(prefersEmbeddedViewer ? 'google-viewer' : 'direct-web');
    }, [normalizedPdfUrl, prefersEmbeddedViewer]);

    useEffect(() => {
        if (!normalizedPdfUrl || canUseNativePdf) {
            return;
        }

        const timeout = setTimeout(() => {
            if (viewerMode === 'google-viewer') {
                console.log('[NoteViewer] Embedded viewer timed out');
                setIsLoading(false);
                setViewerError('Preview is taking too long. Open the PDF directly instead.');
                return;
            }

            console.log('[NoteViewer] Direct web preview timed out, retrying with embedded viewer');
            setViewerMode('google-viewer');
            setViewerError(null);
            setIsLoading(true);
        }, 12000);

        return () => clearTimeout(timeout);
    }, [normalizedPdfUrl, canUseNativePdf, viewerMode]);

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

    const handleOpenExternally = async () => {
        if (!normalizedPdfUrl) {
            Alert.alert('Missing PDF', 'This note does not have a valid PDF URL yet.');
            return;
        }

        const canOpen = await Linking.canOpenURL(normalizedPdfUrl);
        if (!canOpen) {
            Alert.alert('Cannot Open PDF', 'No app is available to open this PDF link.');
            return;
        }

        await Linking.openURL(normalizedPdfUrl);
    };

    const switchToGoogleViewer = () => {
        if (viewerMode === 'google-viewer') {
            setIsLoading(false);
            setViewerError('Preview is unavailable in the in-app viewer for this PDF.');
            return;
        }

        console.log('[NoteViewer] Direct preview failed, retrying with Google viewer');
        setViewerMode('google-viewer');
        setViewerError(null);
        setIsLoading(true);
    };

    const handleWebError = () => {
        switchToGoogleViewer();
    };

    const handleNativeError = (error: any) => {
        console.log('[NoteViewer] Native PDF error:', error);
        setViewerMode('direct-web');
        setIsLoading(true);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: title || 'Note Viewer',
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

            <View style={styles.pdfContainer}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading PDF...</Text>
                    </View>
                )}

                {!normalizedPdfUrl ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No preview available</Text>
                        <Text style={styles.emptyText}>This note does not have a valid PDF link yet.</Text>
                    </View>
                ) : canUseNativePdf ? (
                    <Pdf
                        source={{ uri: normalizedPdfUrl, cache: true }}
                        onLoadComplete={() => {
                            setIsLoading(false);
                            setViewerError(null);
                        }}
                        onError={handleNativeError}
                        style={styles.pdf}
                    />
                ) : (
                    <>
                        <WebView
                            key={`${viewerMode}:${normalizedPdfUrl}`}
                            source={webSource}
                            style={styles.pdf}
                            originWhitelist={['*']}
                            startInLoadingState
                            onLoadEnd={() => {
                                console.log('[NoteViewer] WebView load finished:', viewerMode);
                                setIsLoading(false);
                                setViewerError(null);
                            }}
                            onHttpError={(event) => {
                                console.log('[NoteViewer] WebView HTTP error:', event.nativeEvent.statusCode);
                                handleWebError();
                            }}
                            onError={(event) => {
                                console.log('[NoteViewer] WebView error:', event.nativeEvent);
                                handleWebError();
                            }}
                        />

                        {viewerError && (
                            <View style={styles.errorCard}>
                                <Text style={styles.emptyTitle}>Preview unavailable</Text>
                                <Text style={styles.emptyText}>{viewerError}</Text>
                                <TouchableOpacity style={styles.openButton} onPress={handleOpenExternally}>
                                    <Ionicons name="open-outline" size={18} color={colors.white} />
                                    <Text style={styles.openButtonText}>Open PDF</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>
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
    pdfContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: colors.background,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    emptyState: {
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorCard: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.xl,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    openButton: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    openButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
});
