import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { UserStats } from '../types/note';

export function useUserStats() {
    const [stats, setStats] = useState<UserStats>({
        saved: 0, downloads: 0, notesRead: 0, uploaded: 0,
        totalUploads: 0, downloadsReceived: 0, totalViews: 0, totalLikes: 0,
        averageRating: 0, reputationPoints: 0, badge: '🌟 Beginner', rank: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchStats = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<UserStats>('/user/stats');
            if (cancelledRef.current) return;
            if (res.success && res.data) setStats(res.data);
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useUserStats error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchStats();
        return () => { cancelledRef.current = true; };
    }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
}
