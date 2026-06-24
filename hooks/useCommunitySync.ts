import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePersonalNotes } from '../context/PersonalNotesContext';
import { syncUnpublishedNotes } from './useCommunityNotes';

/** Publishes local uploads to the server so other users can search them. */
export function useCommunitySync() {
    const { user } = useAuth();
    const { notes, markPublished, isLoading } = usePersonalNotes();
    const isSyncing = useRef(false);

    const sync = useCallback(async () => {
        if (!user || isLoading || isSyncing.current) return;

        const pending = notes.filter((note) => !note.isPublished);
        if (pending.length === 0) return;

        isSyncing.current = true;
        try {
            const { synced, failed } = await syncUnpublishedNotes(notes, markPublished);
            if (synced > 0) {
                console.log(`[CommunitySync] Published ${synced} note(s) for global search`);
            }
            if (failed > 0) {
                console.warn(`[CommunitySync] ${failed} note(s) could not be published`);
            }
        } finally {
            isSyncing.current = false;
        }
    }, [user, notes, markPublished, isLoading]);

    const pendingCount = notes.filter((note) => !note.isPublished).length;

    useEffect(() => {
        if (user && !isLoading && pendingCount > 0) {
            sync();
        }
    }, [user?.email, isLoading, pendingCount, sync]);

    return { sync };
}
