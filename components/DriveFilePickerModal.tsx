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
}

export default function DriveFilePickerModal({
    visible,
    onClose,
    onSelect,
}: DriveFilePickerModalProps) {
    const [isPicking, setIsPicking] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.sheet} onStartShouldSetResponder={() => true}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Ionicons name="logo-google" size={24} color={colors.primary} />
                        <Text style={styles.title}>Choose a file</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Pick a PDF, document, or image from Google Drive or your device
                    </Text>

                    {isPicking ? (
                        <View style={styles.loadingBlock}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Opening file browser…</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={handleBrowse}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="folder-open-outline" size={22} color={colors.primary} />
                            <Text style={styles.browseText}>Browse Google Drive & files</Text>
                        </TouchableOpacity>
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xl,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
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
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    loadingBlock: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.background,
        borderRadius: 14,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: '#C7D2FE',
        marginBottom: spacing.md,
        minHeight: 52,
    },
    browseText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.md,
    },
    errorText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    cancelText: {
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.md,
    },
});
