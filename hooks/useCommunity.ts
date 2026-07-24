import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { Note, Subject, College } from '../types/note';

interface CommunityHomeData {
    trending: Note[];
    topRated: Note[];
    recent: Note[];
    verified: Note[];
    subjects: Subject[];
    contributors: Array<{ userId: string; points: number; currentBadge: { name: string } }>;
    colleges: College[];
}

interface CommunityNotesResponse {
    notes: Note[];
    total: number;
    page: number;
    totalPages: number;
}

export function useCommunity() {
    const [data, setData] = useState<CommunityHomeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cancelledRef = useRef(false);

    const fetchCommunity = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch<CommunityHomeData>('/community', { requiresAuth: false });
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError('Failed to load community data');
            }
        } catch (e) {
            if (cancelledRef.current) return;
            setError('Could not reach the server');
            console.error('useCommunity error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchCommunity();
        return () => { cancelledRef.current = true; };
    }, [fetchCommunity]);

    return { data, isLoading, error, refetch: fetchCommunity };
}

export function useCommunityNotes(type: string, sort: string = 'newest', page: number = 1) {
    const [response, setResponse] = useState<CommunityNotesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchNotes() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiFetch<CommunityNotesResponse>(
                    `/community/${type}?sort=${sort}&page=${page}`,
                    { requiresAuth: false }
                );
                if (cancelled) return;
                if (res.success && res.data) {
                    setResponse(res.data);
                } else {
                    setError(res.message || 'Failed to load notes');
                }
            } catch (e) {
                if (cancelled) return;
                console.error('useCommunityNotes error:', e);
                setError('Could not reach the server');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [type, sort, page]);

    return { response, isLoading, error };
}
