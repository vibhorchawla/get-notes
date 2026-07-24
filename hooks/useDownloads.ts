import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';

export interface DownloadNote {
    id: string;
    title: string;
    subject: string;
    unit?: string;
    pdfUrl?: string;
    playlistUrl?: string;
    source?: 'course' | 'community';
    isPremium?: boolean;
}

export function useDownloads() {
    const [downloads, setDownloads] = useState<DownloadNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cancelledRef = useRef(false);

    const fetchDownloads = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch<DownloadNote[]>('/user/downloads');
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setDownloads(res.data);
            } else {
                setError(res.message || 'Failed to load downloads');
            }
        } catch (e) {
            if (cancelledRef.current) return;
            setError('Could not reach the server.');
            console.error('useDownloads fetch error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchDownloads();
        return () => { cancelledRef.current = true; };
    }, [fetchDownloads]);

    const addDownload = async (noteId: string): Promise<boolean> => {
        try {
            const res = await apiFetch('/user/downloads', {
                method: 'POST',
                body: JSON.stringify({ noteId }),
            });
            if (res.success) {
                fetchDownloads();
                return true;
            }
            return false;
        } catch (e) {
            console.error('addDownload error:', e);
            return false;
        }
    };

    return { downloads, isLoading, addDownload, refetch: fetchDownloads, error };
}
