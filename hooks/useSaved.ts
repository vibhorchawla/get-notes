import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';

interface Note {
    id: string;
    title: string;
    subject: string;
    unit?: string;
}

export function useSaved() {
    const [savedNotes, setSavedNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSaved = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<Note[]>('/user/saved');
            if (res.success && res.data) setSavedNotes(res.data);
        } catch (e) {
            console.error('useSaved fetch error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSaved(); }, [fetchSaved]);

    const saveNote = async (noteId: string) => {
        try {
            await apiFetch('/user/saved', {
                method: 'POST',
                body: JSON.stringify({ noteId }),
            });
            fetchSaved();
        } catch (e) {
            console.error('saveNote error:', e);
        }
    };

    const unsaveNote = async (noteId: string) => {
        try {
            await apiFetch(`/user/saved/${noteId}`, { method: 'DELETE' });
            setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (e) {
            console.error('unsaveNote error:', e);
        }
    };

    return { savedNotes, isLoading, saveNote, unsaveNote, refetch: fetchSaved };
}
