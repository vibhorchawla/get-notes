import React, { useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useProfilePhoto } from '../hooks/useProfilePhoto';
import ProfilePhotoSheet from './ProfilePhotoSheet';

interface ProfileAvatarProps {
    size?: number;
    editable?: boolean;
}

export default function ProfileAvatar({ size = 120, editable = true }: ProfileAvatarProps) {
    const { photoUri, isLoading, savePhoto, removePhoto } = useProfilePhoto();
    const [sheetVisible, setSheetVisible] = useState(false);
    const radius = size / 2;
    const badgeSize = Math.max(32, size * 0.3);

    const handlePickedImage = async (result: ImagePicker.ImagePickerResult) => {
        if (result.canceled || !result.assets[0]?.uri) return;
        await savePhoto(result.assets[0].uri);
    };

    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take a profile photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        await handlePickedImage(result);
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow gallery access to choose a profile photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        await handlePickedImage(result);
    };

    const avatarContent = (
        <View
            style={[
                styles.avatarRing,
                {
                    width: size + 8,
                    height: size + 8,
                    borderRadius: radius + 4,
                },
            ]}
        >
            <View
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: radius,
                    },
                ]}
            >
                {isLoading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="person" size={size * 0.42} color={colors.primary} />
                    </View>
                )}
                {editable && photoUri ? (
                    <View style={styles.photoOverlay}>
                        <Ionicons name="camera" size={18} color={colors.white} />
                    </View>
                ) : null}
            </View>
        </View>
    );

    const badgeIcon = photoUri ? 'camera' : 'add';
    const badgeLabel = photoUri ? 'Edit' : 'Add';

    const content = (
        <>
            {avatarContent}
            {editable ? (
                <View
                    style={[
                        styles.editBadge,
                        {
                            width: badgeSize,
                            height: badgeSize,
                            borderRadius: badgeSize / 2,
                        },
                    ]}
                >
                    <Ionicons name={badgeIcon} size={badgeSize * 0.48} color={colors.textOnPrimary} />
                </View>
            ) : null}
        </>
    );

    if (!editable) {
        return <View style={[styles.wrapper, { width: size + 8, height: size + 8 }]}>{content}</View>;
    }

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSheetVisible(true)}
                style={[styles.wrapper, { width: size + 8 }]}
            >
                {content}
                <Text style={styles.tapHint}>{badgeLabel} photo</Text>
            </TouchableOpacity>

            <ProfilePhotoSheet
                visible={sheetVisible}
                photoUri={photoUri}
                isLoading={isLoading}
                onClose={() => setSheetVisible(false)}
                onCamera={pickFromCamera}
                onGallery={pickFromGallery}
                onRemove={removePhoto}
            />
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    avatarRing: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(91, 127, 255, 0.3)',
        backgroundColor: 'rgba(91, 127, 255, 0.12)',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 6,
    },
    avatar: {
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(91, 127, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        right: -2,
        bottom: 18,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.cardBackground,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 5,
    },
    tapHint: {
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.primary,
    },
});
