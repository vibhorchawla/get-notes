import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PdfViewer from '../components/PdfViewer';
import { normalizePdfUrl } from '../utils/localFile';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PdfViewerScreen() {
    const { pdfUrl, title, noteId } = useLocalSearchParams<{
        pdfUrl: string;
        title: string;
        noteId: string;
    }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const normalizedUrl = useMemo(() => normalizePdfUrl(pdfUrl || ''), [pdfUrl]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const lastReadKey = noteId ? `lastRead_${noteId}` : null;
    const lastReadPage = useRef(1);

    const handleLoaded = useCallback(() => {
        setIsLoading(false);
        setLoadError(null);
    }, []);

    const handleProgress = useCallback((loaded: number, total: number) => {
        if (total > 0) {
            setPageCount(total);
            setCurrentPage(loaded);
        }
    }, []);

    const handleError = useCallback((message: string) => {
        setIsLoading(false);
        setLoadError(message);
    }, []);

    const handleBack = useCallback(() => {
        if (lastReadKey) {
            try {
                const Storage = require('expo-secure-store');
                Storage.setItemAsync(lastReadKey, String(lastReadPage.current));
            } catch {}
        }
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(drawer)/home');
        }
    }, [router, lastReadKey]);

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title || 'PDF Viewer'}
                </Text>
                {pageCount !== null && (
                    <View style={styles.pageBadge}>
                        <Text style={styles.pageText}>
                            {currentPage}/{pageCount}
                        </Text>
                    </View>
                )}
                {pageCount === null && <View style={styles.headerSpacer} />}
            </View>

            <View style={styles.pdfArea}>
                {isLoading && !loadError && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading PDF...</Text>
                    </View>
                )}

                {loadError ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={56} color={colors.error || '#EF4444'} />
                        <Text style={styles.errorTitle}>Could not load PDF</Text>
                        <Text style={styles.errorText}>{loadError}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={handleBack}>
                            <Text style={styles.retryText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <PdfViewer
                        pdfUrl={normalizedUrl}
                        onLoaded={handleLoaded}
                        onError={handleError}
                    />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 10,
        backgroundColor: colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border || '#E5E7EB',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginHorizontal: 8,
    },
    pageBadge: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    pageText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
    headerSpacer: {
        width: 60,
    },
    pdfArea: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    errorTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryBtn: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.primary,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: typography.fontWeight.semibold,
    },
});
