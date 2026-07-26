import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { Note } from '../types/note';

export function useSaved() {
    const [savedNotes, setSavedNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchSaved = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Note[]>('/user/saved');
            if (cancelledRef.current) return;
            if (res.success && res.data) setSavedNotes(res.data);
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useSaved fetch error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchSaved();
        return () => { cancelledRef.current = true; };
    }, [fetchSaved]);

    const saveNote = async (noteId: string): Promise<boolean> => {
        try {
            const res = await apiFetch('/user/saved', {
                method: 'POST',
                body: JSON.stringify({ noteId }),
            });
            if (res.success) {
                fetchSaved();
                return true;
            }
            return false;
        } catch (e) {
            console.error('saveNote error:', e);
            return false;
        }
    };

    const unsaveNote = async (noteId: string): Promise<boolean> => {
        try {
            const res = await apiFetch(`/user/saved/${noteId}`, { method: 'DELETE' });
            if (res.success) {
                setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
                return true;
            }
            return false;
        } catch (e) {
            console.error('unsaveNote error:', e);
            return false;
        }
    };

    return { savedNotes, isLoading, saveNote, unsaveNote, refetch: fetchSaved };
}
