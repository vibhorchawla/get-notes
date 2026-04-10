import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { Note } from '../types/note';

const NOTES_FILE_URI = `${(FileSystem as any).documentDirectory}personal_notes_db.json`;

export const usePersonalNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        try {
            setIsLoading(true);
            const fileInfo = await FileSystem.getInfoAsync(NOTES_FILE_URI);
            if (fileInfo.exists) {
                const content = await FileSystem.readAsStringAsync(NOTES_FILE_URI);
                const parsedNotes: Note[] = JSON.parse(content);
                // Sort by descending updatedAt
                setNotes(parsedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const saveNotesToDisk = async (newNotes: Note[]) => {
        try {
            await FileSystem.writeAsStringAsync(NOTES_FILE_URI, JSON.stringify(newNotes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    };

    const addNote = async (title: string, content: string): Promise<Note> => {
        const id = Crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const newNote: Note = {
            id,
            title,
            content,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        await saveNotesToDisk(updatedNotes);
        return newNote;
    };

    const updateNote = async (id: string, title: string, content: string): Promise<Note | null> => {
        const timestamp = new Date().toISOString();
        let updatedNote: Note | null = null;
        
        const updatedNotes = notes.map((note) => {
            if (note.id === id) {
                updatedNote = { ...note, title, content, updatedAt: timestamp };
                return updatedNote;
            }
            return note;
        });

        if (updatedNote) {
            // Re-sort so updated comes first
            const sortedNotes = updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setNotes(sortedNotes);
            await saveNotesToDisk(sortedNotes);
        }
        
        return updatedNote;
    };

    const deleteNote = async (id: string) => {
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        await saveNotesToDisk(updatedNotes);
    };

    const getNote = (id: string): Note | undefined => {
        return notes.find((note) => note.id === id);
    };

    return {
        notes,
        isLoading,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        getNote,
    };
};
