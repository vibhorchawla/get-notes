import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';
import { College, Note } from '../types/note';

export function useColleges() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchColleges() {
            setIsLoading(true);
            try {
                const res = await apiFetch<College[]>('/colleges', { requiresAuth: false });
                if (res.success && res.data) {
                    setColleges(res.data);
                }
            } catch (e) {
                console.error('useColleges error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchColleges();
    }, []);

    return { colleges, isLoading };
}

export function useCollegeNotes(collegeName: string) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!collegeName) return;
        async function fetchNotes() {
            setIsLoading(true);
            try {
                const res = await apiFetch<Note[]>(`/colleges/${encodeURIComponent(collegeName)}/notes`, { requiresAuth: false });
                if (res.success && res.data) {
                    setNotes(res.data);
                }
            } catch (e) {
                console.error('useCollegeNotes error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotes();
    }, [collegeName]);

    return { notes, isLoading };
}
