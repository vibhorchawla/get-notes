import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { UserReputation } from '../types/note';

export function useReputation() {
    const [reputation, setReputation] = useState<UserReputation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchReputation = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<UserReputation>('/reputation/me');
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setReputation(res.data);
            }
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useReputation error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchReputation();
        return () => { cancelledRef.current = true; };
    }, [fetchReputation]);

    return { reputation, isLoading, refetch: fetchReputation };
}

export function useLeaderboard() {
    const [leaders, setLeaders] = useState<Array<UserReputation & { rank: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchLeaderboard = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Array<UserReputation & { rank: number }>>('/reputation/leaderboard', { requiresAuth: false });
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setLeaders(res.data);
            }
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useLeaderboard error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchLeaderboard();
        return () => { cancelledRef.current = true; };
    }, [fetchLeaderboard]);

    return { leaders, isLoading };
}
