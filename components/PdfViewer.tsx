import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

let Pdf: any = null;
try {
    if (Constants.appOwnership !== 'expo') {
        Pdf = require('react-native-pdf').default;
    }
} catch {
    Pdf = null;
}

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import {
    getLocalPdfWebSource,
    getRemotePdfWebSource,
    isLocalFileUrl,
    isRemoteUrl,
    normalizePdfUrl,
    openLocalFile,
    LocalPdfWebSource,
} from '../utils/localFile';

interface PdfViewerProps {
    pdfUrl: string;
    onLoaded?: () => void;
    onError?: (message: string) => void;
}

export default function PdfViewer({ pdfUrl, onLoaded, onError }: PdfViewerProps) {
    const normalizedUrl = useMemo(() => normalizePdfUrl(pdfUrl), [pdfUrl]);
    const isLocal = isLocalFileUrl(normalizedUrl);
    const isRemote = isRemoteUrl(normalizedUrl);
    const isExpoGo = Constants.appOwnership === 'expo';
    const canUseNativePdf = Boolean(Pdf && normalizedUrl);

    const [isLoading, setIsLoading] = useState(true);
    const [localSource, setLocalSource] = useState<LocalPdfWebSource | null>(null);
    const [useGoogleViewer, setUseGoogleViewer] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!normalizedUrl) {
            setLocalSource(null);
            setIsLoading(false);
            return;
        }

        if (!isLocal) {
            setLocalSource(null);
            setUseGoogleViewer(isExpoGo);
            setIsLoading(true);
            setErrorMessage(null);
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setUseGoogleViewer(false);

        getLocalPdfWebSource(normalizedUrl)
            .then((source) => {
                if (cancelled) return;
                if (!source) {
                    const message = 'Could not read this PDF from your device.';
                    setErrorMessage(message);
                    setIsLoading(false);
                    onError?.(message);
                    return;
                }
                setLocalSource(source);
            })
            .catch(() => {
                if (!cancelled) {
                    const message = 'Could not read this PDF from your device.';
                    setErrorMessage(message);
                    setIsLoading(false);
                    onError?.(message);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [normalizedUrl, isLocal, onError]);

    const handleOpenExternally = async () => {
        if (!normalizedUrl) return;

        if (isLocal) {
            const opened = await openLocalFile(normalizedUrl);
            if (!opened) Alert.alert('Cannot Open PDF', 'No app is available to open this PDF.');
            return;
        }

        const canOpen = await Linking.canOpenURL(normalizedUrl);
        if (!canOpen) {
            Alert.alert('Cannot Open PDF', 'No app is available to open this PDF link.');
            return;
        }
        await Linking.openURL(normalizedUrl);
    };

    const handleRemoteError = () => {
        if (isLocal) {
            const message = 'In-app preview failed. Tap Open PDF below.';
            setErrorMessage(message);
            setIsLoading(false);
            onError?.(message);
            return;
        }

        if (!useGoogleViewer && isExpoGo) {
            setUseGoogleViewer(true);
            setIsLoading(true);
            setErrorMessage(null);
            return;
        }

        const message = 'Preview unavailable for this PDF.';
        setErrorMessage(message);
        setIsLoading(false);
        onError?.(message);
    };

    if (!normalizedUrl) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No PDF attached</Text>
                <Text style={styles.emptyText}>This note does not have a PDF file yet.</Text>
            </View>
        );
    }

    if (canUseNativePdf && !isExpoGo) {
        return (
            <View style={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : null}
                <Pdf
                    source={{ uri: normalizedUrl, cache: true }}
                    style={styles.pdf}
                    onLoadComplete={() => {
                        setIsLoading(false);
                        onLoaded?.();
                    }}
                    onError={() => {
                        setIsLoading(false);
                        handleRemoteError();
                    }}
                    trustAllCerts
                />
            </View>
        );
    }

    const webSource = isLocal
        ? localSource
        : isRemote
          ? getRemotePdfWebSource(normalizedUrl, useGoogleViewer)
          : null;

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Opening PDF...</Text>
                </View>
            ) : null}

            {webSource ? (
                <WebView
                    key={`${isLocal ? 'local' : useGoogleViewer ? 'google' : 'direct'}:${normalizedUrl}`}
                    source={webSource}
                    style={styles.pdf}
                    originWhitelist={['*']}
                    allowFileAccess
                    allowFileAccessFromFileURLs
                    allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    onLoadEnd={() => {
                        if (!isLocal) {
                            setIsLoading(false);
                            onLoaded?.();
                        }
                    }}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'loaded') {
                            setIsLoading(false);
                            setErrorMessage(null);
                            onLoaded?.();
                        } else if (event.nativeEvent.data === 'error') {
                            handleRemoteError();
                        }
                    }}
                    onHttpError={() => handleRemoteError()}
                    onError={() => handleRemoteError()}
                />
            ) : isLocal ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.emptyText}>Preparing PDF...</Text>
                </View>
            ) : null}

            {errorMessage ? (
                <View style={styles.errorCard}>
                    <Text style={styles.emptyTitle}>Preview unavailable</Text>
                    <Text style={styles.emptyText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.openButton} onPress={handleOpenExternally}>
                        <Text style={styles.openButtonText}>Open PDF</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: colors.background,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(248, 250, 252, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
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
    },
    errorCard: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.xl,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        elevation: 4,
    },
    openButton: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    openButtonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
    },
});
