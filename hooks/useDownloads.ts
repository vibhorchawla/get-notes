import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';

interface Note {
    id: string;
    title: string;
    subject: string;
    unit?: string;
    isPremium?: boolean;
}

export function useDownloads() {
    const [downloads, setDownloads] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDownloads = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<Note[]>('/user/downloads');
            if (res.success && res.data) setDownloads(res.data);
        } catch (e) {
            console.error('useDownloads fetch error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDownloads(); }, [fetchDownloads]);

    const addDownload = async (noteId: string) => {
        try {
            await apiFetch('/user/downloads', {
                method: 'POST',
                body: JSON.stringify({ noteId }),
            });
            fetchDownloads();
        } catch (e) {
            console.error('addDownload error:', e);
        }
    };

    return { downloads, isLoading, addDownload, refetch: fetchDownloads };
}
