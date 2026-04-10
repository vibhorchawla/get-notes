import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function NoteEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { notes, addNote, updateNote, deleteNote } = usePersonalNotes();
    
    const isNew = id === 'new';
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!isNew && notes.length > 0) {
            const existingNote = notes.find((n) => n.id === id);
            if (existingNote) {
                setTitle(existingNote.title);
                setContent(existingNote.content);
            }
        }
    }, [id, isNew, notes]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Note title cannot be empty.');
            return;
        }

        if (isNew) {
            await addNote(title, content);
        } else {
            await updateNote(id, title, content);
        }
        router.back();
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        await deleteNote(id);
                        router.back();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerRight}>
                        {!isNew && (
                            <TouchableOpacity onPress={handleDelete} style={[styles.headerBtn, { marginRight: spacing.sm }]}>
                                <Ionicons name="trash-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Editor Content */}
                <View style={styles.editor}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Note Title"
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                    <TextInput
                        style={styles.contentInput}
                        placeholder="Start typing your note here..."
                        placeholderTextColor={colors.textLight || colors.textSecondary}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerBtn: {
        padding: spacing.xs,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.sm,
    },
    editor: {
        flex: 1,
        padding: spacing.lg,
    },
    titleInput: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    contentInput: {
        flex: 1,
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
});
