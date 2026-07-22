import type { Router } from 'expo-router';
import { Note } from '../types/note';

export function openNote(
    router: Router,
    note: Pick<Note, 'id' | 'title' | 'pdfUrl' | 'source' | 'isPremium'>
) {
    if (note.pdfUrl) {
        const params: Record<string, string> = { title: note.title };
        if (note.isPremium) params.isPremium = 'true';
        if (!note.pdfUrl.startsWith('file://') && !note.pdfUrl.startsWith('content://')) {
            params.pdfUrl = note.pdfUrl;
        }
        router.push({
            pathname: `/note/${note.id}`,
            params,
        });
        return;
    }

    if (note.source === 'upload') {
        router.push(`/personal-note/${note.id}`);
        return;
    }

    if (note.source === 'community' || note.source === 'course') {
        router.push({
            pathname: '/shared-note/[id]',
            params: { id: note.id },
        });
        return;
    }

    router.push(`/personal-note/${note.id}`);
}
