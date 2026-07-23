import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';
import { UserStats } from '../types/note';

export function useUserStats() {
    const [stats, setStats] = useState<UserStats>({
        saved: 0, downloads: 0, notesRead: 0, uploaded: 0,
        totalUploads: 0, downloadsReceived: 0, totalViews: 0, totalLikes: 0,
        averageRating: 0, reputationPoints: 0, badge: '🌟 Beginner', rank: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<UserStats>('/user/stats');
            if (res.success && res.data) setStats(res.data);
        } catch (e) {
            console.error('useUserStats error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
}
