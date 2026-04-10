import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Note } from '../types/note';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    FadeInDown
} from 'react-native-reanimated';

interface PersonalNoteCardProps {
    note: Note;
    onPress: () => void;
    index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PersonalNoteCard({ note, onPress, index = 0 }: PersonalNoteCardProps) {
    const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
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
        >
            <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
            <Text style={styles.content} numberOfLines={2}>{note.content || 'No content'}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    content: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    date: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        alignSelf: 'flex-end',
    },
});
