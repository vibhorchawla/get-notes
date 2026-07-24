import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';

interface Note {
    id: string;
    title: string;
    subject: string;
    unit?: string;
    pdfUrl?: string | null;
    isPremium?: boolean;
}

export function useNotes(courseId: string) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) return;
        let cancelled = false;
        async function fetchNotes() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiFetch<Note[]>(`/notes/${courseId}`, { requiresAuth: false });
                if (cancelled) return;
                if (res.success && res.data) {
                    setNotes(res.data);
                } else {
                    setNotes([]);
                }
            } catch (e) {
                if (cancelled) return;
                setError('Failed to load notes');
                console.error('useNotes error:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [courseId]);

    return { notes, isLoading, error };
}
