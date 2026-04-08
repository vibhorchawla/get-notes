import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';

interface UserStats {
    saved: number;
    downloads: number;
    notesRead: number;
}

export function useUserStats() {
    const [stats, setStats] = useState<UserStats>({ saved: 0, downloads: 0, notesRead: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setIsLoading(true);
            try {
                const res = await apiFetch<UserStats>('/user/stats');
                if (res.success && res.data) setStats(res.data);
            } catch (e) {
                console.error('useUserStats error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    return { stats, isLoading };
}
