import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { PickedDriveFile, pickFileFromDevice } from '../hooks/useDriveFiles';

interface DriveFilePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (file: PickedDriveFile) => void;
    dark?: boolean;
}

export default function DriveFilePickerModal({
    visible,
    onClose,
    onSelect,
    dark = false,
}: DriveFilePickerModalProps) {
    const [isPicking, setIsPicking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const d = colors.dark;

    const handleBrowse = useCallback(async () => {
        setIsPicking(true);
        setError(null);
        try {
            const picked = await pickFileFromDevice();
            if (picked) {
                onSelect(picked);
                onClose();
            }
        } catch {
            setError('Could not open the file picker. Please try again.');
        } finally {
            setIsPicking(false);
        }
    }, [onClose, onSelect]);

    const wasVisible = useRef(false);

    useEffect(() => {
        if (visible && !wasVisible.current) {
            handleBrowse();
        }
        wasVisible.current = visible;
        if (!visible) {
            setError(null);
        }
    }, [visible, handleBrowse]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={[styles.backdrop, dark && styles.backdropDark]} onPress={onClose}>
                <View style={[styles.sheet, dark && styles.sheetDark]} onStartShouldSetResponder={() => true}>
                    <View style={[styles.handle, dark && styles.handleDark]} />
                    <View style={styles.header}>
                        <Ionicons name="logo-google" size={24} color={dark ? d.primary : colors.primary} />
                        <Text style={[styles.title, dark && styles.titleDark]}>Choose a file</Text>
                    </View>
                    <Text style={[styles.subtitle, dark && styles.subtitleDark]}>
                        Pick a PDF, document, or image from Google Drive or your device
                    </Text>

                    {isPicking ? (
                        <View style={styles.loadingBlock}>
                            <ActivityIndicator size="large" color={dark ? d.primary : colors.primary} />
                            <Text style={[styles.loadingText, dark && styles.loadingTextDark]}>Opening file browser…</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.browseBtn, dark && styles.browseBtnDark]}
                            onPress={handleBrowse}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="folder-open-outline" size={22} color={dark ? d.primary : colors.primary} />
                            <Text style={[styles.browseText, dark && styles.browseTextDark]}>Browse Google Drive & files</Text>
                        </TouchableOpacity>
                    )}

                    {error ? <Text style={[styles.errorText, dark && styles.errorTextDark]}>{error}</Text> : null}

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={[styles.cancelText, dark && styles.cancelTextDark]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    backdropDark: {
        backgroundColor: colors.dark.overlay,
    },
    sheet: {
        backgroundColor: '#121826',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(91, 127, 255, 0.15)',
    },
    sheetDark: {
        backgroundColor: colors.dark.surface,
        borderTopColor: colors.dark.border,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: spacing.sm,
    },
    handleDark: {
        backgroundColor: colors.dark.textMuted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    titleDark: {
        color: colors.dark.text,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: spacing.lg,
    },
    subtitleDark: {
        color: colors.dark.textSecondary,
    },
    loadingBlock: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    loadingTextDark: {
        color: colors.dark.textSecondary,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(91, 127, 255, 0.25)',
        marginBottom: spacing.md,
        minHeight: 52,
    },
    browseBtnDark: {
        backgroundColor: colors.dark.chipBg,
        borderColor: colors.dark.chipBorder,
    },
    browseText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.md,
    },
    browseTextDark: {
        color: colors.dark.primary,
    },
    errorText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    errorTextDark: {
        color: colors.dark.textSecondary,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    cancelText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.md,
    },
    cancelTextDark: {
        color: colors.dark.textMuted,
    },
});
