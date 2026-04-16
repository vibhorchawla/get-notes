import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

// Only import native PDF if NOT in Expo Go to avoid crashes
let Pdf: any = null;
try {
    if (Constants.appOwnership !== 'expo') {
        Pdf = require('react-native-pdf').default;
    }
} catch (e) {
    console.log('Native PDF module not found, falling back to WebView');
}

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useSaved } from '../../hooks/useSaved';
import { useDownloads } from '../../hooks/useDownloads';

export default function NoteViewer() {
    const { id, title, pdfUrl } = useLocalSearchParams<{ 
        id: string; 
        title: string; 
        pdfUrl: string 
    }>();
    
    const [isLoading, setIsLoading] = useState(true);
    const { savedNotes, saveNote, unsaveNote } = useSaved();
    const { addDownload } = useDownloads();

    const isSaved = savedNotes.some((n) => n.id === id);
    const isExpoGo = Constants.appOwnership === 'expo';

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

    // Construct the WebView source. 
    // On Android, we use Google Docs Viewer for better PDF rendering in WebView.
    const webViewUrl = Platform.OS === 'android' 
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl || '')}&embedded=true`
        : pdfUrl;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: title || 'Note Viewer',
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                                <Ionicons 
                                    name={isSaved ? "bookmark" : "bookmark-outline"} 
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
                
                {Pdf && !isExpoGo ? (
                    <Pdf
                        source={{ uri: pdfUrl, cache: true }}
                        onLoadComplete={() => setIsLoading(false)}
                        onError={(error: any) => {
                            console.log(error);
                            setIsLoading(false);
                            Alert.alert('Error', 'Failed to load PDF in native viewer.');
                        }}
                        style={styles.pdf}
                    />
                ) : (
                    <WebView
                        source={{ uri: webViewUrl }}
                        style={styles.pdf}
                        onLoadEnd={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            Alert.alert('Error', 'Failed to load PDF in browser viewer.');
                        }}
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
});

