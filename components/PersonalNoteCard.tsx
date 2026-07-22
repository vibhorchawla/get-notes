import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isDriveStoredUrl } from '../utils/driveLink';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    FadeInDown
} from 'react-native-reanimated';

import { Note } from '../types/note';

interface PersonalNoteCardProps {
    note: Note;
    onPress: () => void;
    onShare?: () => void;
    index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PersonalNoteCard({ note, onPress, onShare, index = 0 }: PersonalNoteCardProps) {
    const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <AnimatedPressable 
            style={[styles.card, animatedStyle]} 
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            entering={FadeInDown.delay(index * 100).springify().damping(14)}
            accessibilityRole="button"
            accessibilityLabel={`${note.title}${note.subject ? `, ${note.subject}` : ''}`}
        >
            <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
                {note.isPremium && (
                    <View style={styles.premiumBadgeSmall}>
                        <Ionicons name="diamond" size={9} color="#FFFFFF" />
                        <Text style={styles.premiumBadgeSmallText}>Premium</Text>
                    </View>
                )}
            </View>
            <View style={styles.tagRow}>
                {note.pdfUrl && (
                    <View style={styles.tag}>
                        <Ionicons
                            name={note.noteType === 'drive' || isDriveStoredUrl(note.pdfUrl) ? 'logo-google' : 'document-text-outline'}
                            size={12}
                            color={colors.primary}
                        />
                        <Text style={styles.tagText}>
                            {note.noteType === 'drive' || isDriveStoredUrl(note.pdfUrl) ? 'Drive' : 'PDF'}
                        </Text>
                    </View>
                )}
                {note.playlistUrl && (
                    <View style={styles.tag}>
                        <Ionicons name="play-circle-outline" size={12} color={colors.primary} />
                        <Text style={styles.tagText}>Playlist</Text>
                    </View>
                )}
            </View>
            <Text style={styles.content} numberOfLines={2}>{note.content || 'No content'}</Text>
            <View style={styles.footer}>
                <Text style={styles.date}>{formattedDate}</Text>
                {note.isPublished ? (
                    <View style={styles.sharedPill}>
                        <Ionicons name="globe-outline" size={12} color={colors.accent} />
                        <Text style={styles.sharedText}>Shared</Text>
                    </View>
                ) : onShare ? (
                    <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                        <Ionicons name="cloud-upload-outline" size={14} color={colors.primary} />
                        <Text style={styles.shareButtonText}>Share for search</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    premiumBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#7C3AED',
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    premiumBadgeSmallText: {
        fontSize: 9,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        flexShrink: 1,
    },
    tagRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tagText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    content: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    date: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    sharedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    sharedText: {
        fontSize: typography.fontSize.xs,
        color: colors.accent,
        fontWeight: typography.fontWeight.semibold,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    shareButtonText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
});
