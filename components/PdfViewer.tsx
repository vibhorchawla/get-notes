import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import Constants from 'expo-constants';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

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
    const isLoadingRef = useRef(true);
    const [localSource, setLocalSource] = useState<LocalPdfWebSource | null>(null);
    const [remoteSource, setRemoteSource] = useState<LocalPdfWebSource | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState({ loaded: 0, total: 0 });

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    useEffect(() => {
        if (progress.total > 0) {
            Animated.timing(progressAnim, {
                toValue: progress.loaded / progress.total,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start();
        }
    }, [progress, progressAnim]);

    useEffect(() => {
        let cancelled = false;

        if (!normalizedUrl) {
            setLocalSource(null);
            setRemoteSource(null);
            setIsLoading(false);
            return;
        }

        if (isLocal) {
            isLoadingRef.current = true;
            setIsLoading(true);
            setErrorMessage(null);
            setRemoteSource(null);
            setProgress({ loaded: 0, total: 0 });

            getLocalPdfWebSource(normalizedUrl)
                .then((source) => {
                    if (cancelled) return;
                    if (!source) {
                        const msg = 'Could not read this PDF from your device.';
                        setErrorMessage(msg);
                        isLoadingRef.current = false;
                        setIsLoading(false);
                        onError?.(msg);
                        return;
                    }
                    setLocalSource(source);
                })
                .catch(() => {
                    if (!cancelled) {
                        const msg = 'Could not read this PDF from your device.';
                        setErrorMessage(msg);
                        isLoadingRef.current = false;
                        setIsLoading(false);
                        onError?.(msg);
                    }
                });
        } else if (isRemote) {
            setLocalSource(null);
            isLoadingRef.current = true;
            setIsLoading(true);
            setErrorMessage(null);
            setProgress({ loaded: 0, total: 0 });
            setRemoteSource(getRemotePdfWebSource(normalizedUrl));
        }

        return () => {
            cancelled = true;
        };
    }, [normalizedUrl, isLocal, isRemote, onError]);

    const handleWebViewMessage = (event: WebViewMessageEvent) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'progress') {
                setProgress({ loaded: msg.loaded || 0, total: msg.total || 0 });
                if (msg.total > 0 && isLoadingRef.current) {
                    isLoadingRef.current = false;
                    setIsLoading(false);
                    onLoaded?.();
                }
            } else if (msg.type === 'loaded') {
                isLoadingRef.current = false;
                setIsLoading(false);
                setErrorMessage(null);
                onLoaded?.();
            } else if (msg.type === 'error') {
                const message = 'Could not render this PDF.';
                setErrorMessage(message);
                isLoadingRef.current = false;
                setIsLoading(false);
                onError?.(message);
            }
        } catch {
            if (event.nativeEvent.data === 'loaded') {
                isLoadingRef.current = false;
                setIsLoading(false);
                setErrorMessage(null);
                onLoaded?.();
            } else if (event.nativeEvent.data === 'error') {
                const message = 'Could not render this PDF.';
                setErrorMessage(message);
                isLoadingRef.current = false;
                setIsLoading(false);
                onError?.(message);
            }
        }
    };

    const renderLoadingUI = () => {
        if (!isLoading) return null;
        const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
        const showProgress = progress.total > 0;

        return (
            <View style={styles.loadingOverlay}>
                <View style={styles.loadingCard}>
                    <Animated.View style={[styles.loadingIcon, { opacity: pulseAnim }]}>
                        <Ionicons name="document-text-outline" size={40} color={colors.primary} />
                    </Animated.View>

                    <Text style={styles.loadingTitle}>Opening PDF</Text>

                    <Text style={styles.loadingSubtitle}>
                        {showProgress
                            ? `Preparing document... ${progress.loaded}/${progress.total} pages (${pct}%)`
                            : 'Preparing document...'}
                    </Text>

                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    if (!normalizedUrl) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No PDF attached</Text>
                <Text style={styles.emptyText}>This note does not have a PDF file yet.</Text>
            </View>
        );
    }

    if (canUseNativePdf && !isExpoGo) {
        return (
            <View style={styles.container}>
                {renderLoadingUI()}
                <Pdf
                    source={{ uri: normalizedUrl, cache: true }}
                    style={styles.pdf}
                    onLoadComplete={() => {
                        setIsLoading(false);
                        onLoaded?.();
                    }}
                    onError={() => {
                        setIsLoading(false);
                        const message = 'Could not render this PDF.';
                        setErrorMessage(message);
                        onError?.(message);
                    }}
                    trustAllCerts
                />
            </View>
        );
    }

    const webSource = isLocal ? localSource : remoteSource;

    return (
        <View style={styles.container}>
            {renderLoadingUI()}

            {webSource ? (
                <WebView
                    key={`pdf:${normalizedUrl}`}
                    source={webSource}
                    style={styles.pdf}
                    originWhitelist={['*']}
                    allowFileAccess
                    allowFileAccessFromFileURLs
                    allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    onLoadEnd={() => {}}
                    onMessage={handleWebViewMessage}
                    onHttpError={() => {
                        const msg = 'Could not load this PDF.';
                        setErrorMessage(msg);
                        setIsLoading(false);
                        onError?.(msg);
                    }}
                    onError={() => {
                        const msg = 'Could not load this PDF.';
                        setErrorMessage(msg);
                        setIsLoading(false);
                        onError?.(msg);
                    }}
                />
            ) : isLocal ? (
                <View style={styles.emptyState}>
                    <Animated.View style={{ opacity: pulseAnim }}>
                        <Ionicons name="document-outline" size={48} color={colors.primary} />
                    </Animated.View>
                    <Text style={styles.loadingSubtitle}>Reading PDF file...</Text>
                </View>
            ) : null}

            {errorMessage ? (
                <View style={styles.errorOverlay}>
                    <Ionicons name="alert-circle-outline" size={28} color={colors.error} />
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
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
        backgroundColor: 'rgba(248, 250, 252, 0.96)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 36,
        paddingVertical: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        minWidth: 200,
    },
    loadingIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 6,
    },
    loadingSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    progressTrack: {
        width: 160,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        gap: 8,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    errorOverlay: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.xl,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        elevation: 4,
        alignItems: 'center',
        gap: 4,
    },
    errorTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
