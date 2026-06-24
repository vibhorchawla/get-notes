import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from './useApi';
import { useAuth } from '../context/AuthContext';
import { usePersonalNotes } from './usePersonalNotes';
import { Note, noteMatchesSearch } from '../types/note';

function mergeNoteResults(local: Note[], remote: Note[]): Note[] {
    const byId = new Map<string, Note>();

    for (const note of local) {
        byId.set(note.id, note);
    }

    for (const note of remote) {
        if (!byId.has(note.id)) {
            byId.set(note.id, note);
        }
    }

    return Array.from(byId.values());
}

export function useNoteSearch(query: string) {
    const { user } = useAuth();
    const { notes: personalNotes, loadNotes } = usePersonalNotes();
    const [remoteResults, setRemoteResults] = useState<Note[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [loadNotes])
    );

    const localResults = useMemo(() => {
        const trimmed = query.trim();
        if (!trimmed) return [];

        return personalNotes
            .filter((note) => noteMatchesSearch(note, trimmed))
            .map((note) => ({
                ...note,
                source: (note.isPublished ? 'community' : 'upload') as Note['source'],
                uploadedBy: user
                    ? { id: user.id || '', name: user.name, course: user.course }
                    : note.uploadedBy,
            }));
    }, [personalNotes, query, user]);

    const results = useMemo(
        () => mergeNoteResults(localResults, remoteResults),
        [localResults, remoteResults]
    );

    const searchRemote = useCallback(async (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setRemoteResults([]);
            setError(null);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            let res = await apiFetch<Note[]>(`/search?q=${encodeURIComponent(trimmed)}`, {
                requiresAuth: false,
            });

            if (!res.success) {
                res = await apiFetch<Note[]>(
                    `/notes/search?q=${encodeURIComponent(trimmed)}`,
                    { requiresAuth: false }
                );
            }

            if (res.success && res.data) {
                setRemoteResults(
                    res.data.map((note) => ({
                        ...note,
                        source: note.source || (note.uploadedBy ? 'community' : 'course'),
                    }))
                );
                setError(null);
            } else {
                setRemoteResults([]);
                setError(
                    'Shared notes unavailable. Run npm run server on your PC, then upload again while signed in.'
                );
            }
        } catch (e) {
            console.error('useNoteSearch error:', e);
            setRemoteResults([]);
            setError(
                'Cannot reach the server. Start it with: npm run server'
            );
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setRemoteResults([]);
            setError(null);
            return;
        }

        const timer = setTimeout(() => {
            searchRemote(trimmed);
        }, 350);

        return () => clearTimeout(timer);
    }, [query, searchRemote]);

    return { results, isSearching, error, hasLocalResults: localResults.length > 0 };
}
