import { useState, useEffect, useCallback } from 'react';
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

    const fetchCommunity = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch<CommunityHomeData>('/community', { requiresAuth: false });
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError('Failed to load community data');
            }
        } catch (e) {
            setError('Could not reach the server');
            console.error('useCommunity error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchCommunity(); }, [fetchCommunity]);

    return { data, isLoading, error, refetch: fetchCommunity };
}

export function useCommunityNotes(type: string, sort: string = 'newest', page: number = 1) {
    const [response, setResponse] = useState<CommunityNotesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchNotes() {
            setIsLoading(true);
            try {
                const res = await apiFetch<CommunityNotesResponse>(
                    `/community/${type}?sort=${sort}&page=${page}`,
                    { requiresAuth: false }
                );
                if (res.success && res.data) {
                    setResponse(res.data);
                }
            } catch (e) {
                console.error('useCommunityNotes error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotes();
    }, [type, sort, page]);

    return { response, isLoading };
}
