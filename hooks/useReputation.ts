import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';
import { UserReputation } from '../types/note';

export function useReputation() {
    const [reputation, setReputation] = useState<UserReputation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReputation = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<UserReputation>('/reputation/me');
            if (res.success && res.data) {
                setReputation(res.data);
            }
        } catch (e) {
            console.error('useReputation error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchReputation(); }, [fetchReputation]);

    return { reputation, isLoading, refetch: fetchReputation };
}

export function useLeaderboard() {
    const [leaders, setLeaders] = useState<Array<UserReputation & { rank: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true);
            try {
                const res = await apiFetch<Array<UserReputation & { rank: number }>>('/reputation/leaderboard', { requiresAuth: false });
                if (res.success && res.data) {
                    setLeaders(res.data);
                }
            } catch (e) {
                console.error('useLeaderboard error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    return { leaders, isLoading };
}
