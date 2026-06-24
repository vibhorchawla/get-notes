import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

type SheetView = 'options' | 'confirmRemove';

interface ProfilePhotoSheetProps {
    visible: boolean;
    photoUri: string | null;
    isLoading?: boolean;
    onClose: () => void;
    onCamera: () => void;
    onGallery: () => void;
    onRemove: () => void;
}

interface OptionRowProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    destructive?: boolean;
}

function OptionRow({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    onPress,
    destructive,
}: OptionRowProps) {
    return (
        <TouchableOpacity
            style={styles.optionRow}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.optionIconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <View style={styles.optionText}>
                <Text style={[styles.optionTitle, destructive && styles.optionTitleDestructive]}>
                    {title}
                </Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={18}
                color={destructive ? colors.error : colors.textLight}
            />
        </TouchableOpacity>
    );
}

export default function ProfilePhotoSheet({
    visible,
    photoUri,
    isLoading,
    onClose,
    onCamera,
    onGallery,
    onRemove,
}: ProfilePhotoSheetProps) {
    const [view, setView] = useState<SheetView>('options');

    useEffect(() => {
        if (visible) setView('options');
    }, [visible]);

    const handleClose = () => {
        setView('options');
        onClose();
    };

    const handleRemoveConfirm = () => {
        onRemove();
        setView('options');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.backdrop}>
                <Pressable style={styles.backdropTap} onPress={handleClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    {view === 'options' ? (
                        <>
                            <View style={styles.header}>
                                <View style={styles.previewRing}>
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.primary} />
                                    ) : photoUri ? (
                                        <Image source={{ uri: photoUri }} style={styles.previewImage} />
                                    ) : (
                                        <View style={styles.previewPlaceholder}>
                                            <Ionicons name="person" size={36} color={colors.primary} />
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.title}>Profile Photo</Text>
                                <Text style={styles.subtitle}>
                                    Update how you appear across GetNotes
                                </Text>
                            </View>

                            <View style={styles.optionsCard}>
                                <OptionRow
                                    icon="camera"
                                    iconBg="#EEF2FF"
                                    iconColor={colors.primary}
                                    title="Take a Photo"
                                    subtitle="Use your camera"
                                    onPress={() => {
                                        handleClose();
                                        onCamera();
                                    }}
                                />
                                <View style={styles.optionDivider} />
                                <OptionRow
                                    icon="images"
                                    iconBg="#FDF2F8"
                                    iconColor={colors.secondary}
                                    title="Choose from Gallery"
                                    subtitle="Pick an existing picture"
                                    onPress={() => {
                                        handleClose();
                                        onGallery();
                                    }}
                                />
                                {photoUri ? (
                                    <>
                                        <View style={styles.optionDivider} />
                                        <OptionRow
                                            icon="trash-outline"
                                            iconBg="#FEF2F2"
                                            iconColor={colors.error}
                                            title="Remove Photo"
                                            subtitle="Revert to default avatar"
                                            onPress={() => setView('confirmRemove')}
                                            destructive
                                        />
                                    </>
                                ) : null}
                            </View>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.confirmBlock}>
                            <View style={styles.confirmIconWrap}>
                                <Ionicons name="warning-outline" size={32} color={colors.error} />
                            </View>
                            <Text style={styles.confirmTitle}>Remove profile photo?</Text>
                            <Text style={styles.confirmSubtitle}>
                                Your photo will be removed. You can add a new one anytime.
                            </Text>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={handleRemoveConfirm}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.white} />
                                <Text style={styles.removeButtonText}>Yes, remove photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setView('options')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.backButtonText}>Go back</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropTap: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    sheet: {
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl + 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 16,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginBottom: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    previewRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: colors.primary,
        padding: 3,
        marginBottom: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    previewPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: spacing.xs,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    optionsCard: {
        backgroundColor: colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    optionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    optionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    optionTitleDestructive: {
        color: colors.error,
    },
    optionSubtitle: {
        marginTop: 2,
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    optionDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 44 + spacing.md * 2,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
    },
    confirmBlock: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    confirmIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    confirmTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    confirmSubtitle: {
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.md,
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        width: '100%',
        paddingVertical: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.error,
        marginBottom: spacing.sm,
    },
    removeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },
    backButton: {
        width: '100%',
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.primary,
    },
});
