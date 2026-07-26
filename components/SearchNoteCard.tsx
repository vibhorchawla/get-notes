import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { Note } from '../types/note';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface SearchNoteCardProps {
    note: Note;
    onPress: () => void;
    onRemove?: () => void;
    onUploaderPress?: () => void;
    index?: number;
}

function getBadgeStyle(source?: Note['source']) {
    if (source === 'upload') return { wrap: styles.badgeUpload, text: styles.badgeTextUpload, label: 'My Upload' };
    if (source === 'community') return { wrap: styles.badgeCommunity, text: styles.badgeTextCommunity, label: 'Shared' };
    return { wrap: styles.badgeCourse, text: styles.badgeTextCourse, label: 'Course' };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SearchNoteCard({ note, onPress, onRemove, onUploaderPress, index = 0 }: SearchNoteCardProps) {
    const badge = getBadgeStyle(note.source);
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); };
    const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            style={[styles.card, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            entering={FadeInDown.delay(index * 60).springify().damping(14)}
            accessibilityRole="button"
            accessibilityLabel={`${note.title}${note.subject ? `, ${note.subject}` : ''}${badge.label ? `, ${badge.label}` : ''}`}
        >
            <View style={styles.iconWrap}>
                <Ionicons
                    name={note.isPremium ? 'lock-closed' : note.pdfUrl ? 'document-text' : note.playlistUrl ? 'play-circle' : 'document-outline'}
                    size={20}
                    color={note.isPremium ? '#F59E0B' : colors.primary}
                />
            </View>

            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {note.title}
                </Text>
                <View style={styles.metaRow}>
                    {note.subject ? <Text style={styles.meta}>{note.subject}</Text> : null}
                    {note.unit ? (
                        <>
                            <Text style={styles.dot}>·</Text>
                            <Text style={styles.meta}>{note.unit}</Text>
                        </>
                    ) : null}
                </View>
                {(note.uploaderName || note.uploadedBy?.name) ? (
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); onUploaderPress?.(); }} activeOpacity={0.7}>
                        <Text style={styles.uploader}>by {note.uploaderName || note.uploadedBy?.name}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.trailing}>
                {note.isPremium && (
                    <View style={styles.premiumBadgeSmall}>
                        <Ionicons name="diamond" size={8} color="#FFFFFF" />
                        <Text style={styles.premiumBadgeSmallText}>Premium</Text>
                    </View>
                )}
                <View style={[styles.badge, badge.wrap]}>
                    <Text style={[styles.badgeText, badge.text]}>{badge.label}</Text>
                </View>
                {onRemove ? (
                    <Pressable style={styles.removeBtn} onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove bookmark">
                        <Ionicons name="bookmark" size={16} color={colors.primary} />
                    </Pressable>
                ) : null}
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.cardPadding,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    body: {
        flex: 1,
        paddingRight: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    meta: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    dot: {
        marginHorizontal: 4,
        color: colors.textLight,
    },
    uploader: {
        marginTop: 4,
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
    },
    trailing: {
        alignItems: 'flex-end',
        gap: spacing.xs,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    premiumBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginBottom: 4,
    },
    premiumBadgeSmallText: {
        fontSize: 9,
        fontWeight: typography.fontWeight.bold,
        color: '#F59E0B',
    },
    removeBtn: {
        padding: 4,
    },
    badgeUpload: {
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    badgeCommunity: {
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
    },
    badgeCourse: {
        backgroundColor: 'rgba(91, 127, 255, 0.10)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: typography.fontWeight.bold,
    },
    badgeTextUpload: {
        color: colors.warning,
    },
    badgeTextCommunity: {
        color: colors.success,
    },
    badgeTextCourse: {
        color: colors.primary,
    },
});
