import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import NoteItem from '../../components/NoteItem';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface Note {
    id: string;
    title: string;
    subject: string;
    unit?: string;
}

// Placeholder data for notes
const NOTES_DATA: Record<string, Note[]> = {
    'btech-cse': [
        { id: '1', title: 'Data Structures - Arrays & Linked Lists', subject: 'Data Structures', unit: 'Unit 1' },
        { id: '2', title: 'Algorithm Analysis & Complexity', subject: 'Algorithms', unit: 'Unit 1' },
        { id: '3', title: 'Object Oriented Programming Concepts', subject: 'OOP', unit: 'Unit 2' },
        { id: '4', title: 'Database Management Systems - ER Model', subject: 'DBMS', unit: 'Unit 1' },
        { id: '5', title: 'Operating Systems - Process Management', subject: 'OS', unit: 'Unit 2' },
    ],
    'btech-me': [
        { id: '1', title: 'Thermodynamics - First Law', subject: 'Thermodynamics', unit: 'Unit 1' },
        { id: '2', title: 'Fluid Mechanics - Flow Properties', subject: 'Fluid Mechanics', unit: 'Unit 1' },
        { id: '3', title: 'Machine Design - Stress Analysis', subject: 'Machine Design', unit: 'Unit 2' },
    ],
    'btech-ee': [
        { id: '1', title: 'Circuit Theory - Network Theorems', subject: 'Circuit Theory', unit: 'Unit 1' },
        { id: '2', title: 'Electromagnetic Fields', subject: 'EMF', unit: 'Unit 1' },
        { id: '3', title: 'Power Systems - Generation', subject: 'Power Systems', unit: 'Unit 2' },
    ],
    'bca': [
        { id: '1', title: 'C Programming - Basics', subject: 'C Programming', unit: 'Unit 1' },
        { id: '2', title: 'Web Development - HTML & CSS', subject: 'Web Dev', unit: 'Unit 1' },
        { id: '3', title: 'Database Concepts', subject: 'Database', unit: 'Unit 2' },
    ],
    'mca': [
        { id: '1', title: 'Advanced Java - Servlets & JSP', subject: 'Advanced Java', unit: 'Unit 1' },
        { id: '2', title: 'Software Engineering - SDLC', subject: 'Software Engg', unit: 'Unit 1' },
        { id: '3', title: 'Data Mining Techniques', subject: 'Data Mining', unit: 'Unit 2' },
    ],
    'diploma': [
        { id: '1', title: 'Basic Electronics', subject: 'Electronics', unit: 'Unit 1' },
        { id: '2', title: 'Engineering Drawing', subject: 'Drawing', unit: 'Unit 1' },
        { id: '3', title: 'Workshop Practice', subject: 'Workshop', unit: 'Unit 2' },
    ],
};

export default function NotesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const notes = NOTES_DATA[id] || [];

    const handleNotePress = (noteId: string) => {
        Alert.alert('Note Viewer', 'PDF viewer placeholder - Note ID: ' + noteId);
    };

    const handleDownload = (noteId: string) => {
        Alert.alert('Download', 'Download functionality placeholder - Note ID: ' + noteId);
    };

    const getCourseTitle = (courseId: string) => {
        const titles: Record<string, string> = {
            'btech-cse': 'B.Tech CSE',
            'btech-me': 'B.Tech ME',
            'btech-ee': 'B.Tech EE',
            'bca': 'BCA',
            'mca': 'MCA',
            'diploma': 'Diploma',
        };
        return titles[courseId] || 'Course Notes';
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: getCourseTitle(id),
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.textPrimary,
                }}
            />
            <GradientBackground>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Available Notes</Text>

                        {notes.length > 0 ? (
                            <View style={styles.notesList}>
                                {notes.map((note) => (
                                    <NoteItem
                                        key={note.id}
                                        title={note.title}
                                        subject={note.subject}
                                        unit={note.unit}
                                        onPress={() => handleNotePress(note.id)}
                                        onDownload={() => handleDownload(note.id)}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No notes available yet</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </GradientBackground>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.screenPadding,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    notesList: {
        marginBottom: spacing.lg,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
    },
});
