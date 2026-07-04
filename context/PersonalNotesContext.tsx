import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { Note } from '../types/note';
import { isGoogleDriveLink, toDriveViewUrl } from '../utils/driveLink';

const NOTES_FILE_URI = `${FileSystem.documentDirectory}personal_notes_db.json`;

function inferNoteType(note: Partial<Note>): Note['noteType'] {
    if (note.pdfUrl && note.playlistUrl) return 'mixed';
    if (note.pdfUrl) {
        return isGoogleDriveLink(note.pdfUrl) || /drive\.google\.com/i.test(note.pdfUrl)
            ? 'drive'
            : 'pdf';
    }
    if (note.playlistUrl) return 'playlist';
    return 'text';
}

function extractUrlAfterLabel(content: string, labels: string[]): string | undefined {
    for (const label of labels) {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = content.match(new RegExp(`${escapedLabel}:\\s*(https?:\\/\\/\\S+)`, 'i'));
        if (match?.[1]) return match[1];
    }
    return undefined;
}

function normalizeNote(note: Note): Note {
    const rawDriveOrPdf =
        note.pdfUrl ||
        extractUrlAfterLabel(note.content, ['Drive Link', 'Google Drive Link', 'PDF Link']);
    const playlistUrl =
        note.playlistUrl || extractUrlAfterLabel(note.content, ['Playlist Link']);

    const pdfUrl = rawDriveOrPdf
        ? isGoogleDriveLink(rawDriveOrPdf) || /drive\.google\.com/i.test(rawDriveOrPdf)
            ? toDriveViewUrl(rawDriveOrPdf)
            : rawDriveOrPdf
        : undefined;

    return {
        ...note,
        subject: note.subject,
        unit: note.unit,
        pdfUrl,
        playlistUrl,
        noteType: note.noteType || inferNoteType({ pdfUrl, playlistUrl }),
    };
}

interface PersonalNotesContextType {
    notes: Note[];
    isLoading: boolean;
    loadNotes: () => Promise<void>;
    addNote: (noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
    updateNote: (
        id: string,
        noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<Note | null>;
    deleteNote: (id: string) => Promise<void>;
    markPublished: (id: string) => Promise<void>;
    getNote: (id: string) => Note | undefined;
}

const PersonalNotesContext = createContext<PersonalNotesContextType | undefined>(undefined);

export function PersonalNotesProvider({ children }: { children: React.ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        try {
            setIsLoading(true);
            const fileInfo = await FileSystem.getInfoAsync(NOTES_FILE_URI);
            if (fileInfo.exists) {
                const content = await FileSystem.readAsStringAsync(NOTES_FILE_URI);
                const parsedNotes: Note[] = JSON.parse(content).map(normalizeNote);
                setNotes(
                    parsedNotes.sort(
                        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    )
                );
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

    const addNote = async (
        noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Note> => {
        const id = Crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const newNote = normalizeNote({
            id,
            ...noteInput,
            createdAt: timestamp,
            updatedAt: timestamp,
        } as Note);

        setNotes((prev) => {
            const updatedNotes = [newNote, ...prev];
            void saveNotesToDisk(updatedNotes);
            return updatedNotes;
        });
        return newNote;
    };

    const updateNote = async (
        id: string,
        noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Note | null> => {
        const timestamp = new Date().toISOString();
        let updatedNote: Note | null = null;

        const updatedNotes = notes.map((note) => {
            if (note.id === id) {
                updatedNote = normalizeNote({
                    ...note,
                    ...noteInput,
                    updatedAt: timestamp,
                } as Note);
                return updatedNote;
            }
            return note;
        });

        if (updatedNote) {
            const sortedNotes = updatedNotes.sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
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

    const markPublished = async (id: string) => {
        setNotes((prev) => {
            const updatedNotes = prev.map((note) =>
                note.id === id ? { ...note, isPublished: true } : note
            );
            void saveNotesToDisk(updatedNotes);
            return updatedNotes;
        });
    };

    const getNote = (id: string): Note | undefined => notes.find((note) => note.id === id);

    return (
        <PersonalNotesContext.Provider
            value={{
                notes,
                isLoading,
                loadNotes,
                addNote,
                updateNote,
                deleteNote,
                markPublished,
                getNote,
            }}
        >
            {children}
        </PersonalNotesContext.Provider>
    );
}

export function usePersonalNotes() {
    const context = useContext(PersonalNotesContext);
    if (context === undefined) {
        throw new Error('usePersonalNotes must be used within a PersonalNotesProvider');
    }
    return context;
}
