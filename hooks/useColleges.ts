import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';
import { College, Note } from '../types/note';

export function useColleges() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function fetchColleges() {
            setIsLoading(true);
            try {
                const res = await apiFetch<College[]>('/colleges', { requiresAuth: false });
                if (cancelled) return;
                if (res.success && res.data) {
                    setColleges(res.data);
                }
            } catch (e) {
                if (cancelled) return;
                console.error('useColleges error:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        fetchColleges();
        return () => { cancelled = true; };
    }, []);

    return { colleges, isLoading };
}

export function useCollegeNotes(collegeName: string) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!collegeName) return;
        let cancelled = false;
        async function fetchNotes() {
            setIsLoading(true);
            try {
                const res = await apiFetch<Note[]>(`/colleges/${encodeURIComponent(collegeName)}/notes`, { requiresAuth: false });
                if (cancelled) return;
                if (res.success && res.data) {
                    setNotes(res.data);
                }
            } catch (e) {
                if (cancelled) return;
                console.error('useCollegeNotes error:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [collegeName]);

    return { notes, isLoading };
}
