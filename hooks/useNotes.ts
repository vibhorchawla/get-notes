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
        async function fetchNotes() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiFetch<Note[]>(`/notes/${courseId}`, { requiresAuth: false });
                if (res.success && res.data) {
                    setNotes(res.data);
                } else {
                    setNotes([]);
                }
            } catch (e) {
                setError('Failed to load notes');
                console.error('useNotes error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotes();
    }, [courseId]);

    return { notes, isLoading, error };
}
