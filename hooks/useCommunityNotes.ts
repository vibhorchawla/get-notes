import { getToken, apiFetch } from './useApi';
import { Note } from '../types/note';

export type PublishResult = {
    ok: boolean;
    message?: string;
    note?: Note;
};

export async function publishCommunityNote(note: Note): Promise<PublishResult> {
    const token = await getToken();
    if (!token) {
        return {
            ok: false,
            message: 'Sign in required so other students can search your notes.',
        };
    }

    const isServerId = /^[0-9a-fA-F]{24}$/.test(note.id || '');
    const payload = {
        id: isServerId ? note.id : undefined,
        title: note.title,
        content: note.content,
        course: note.course,
        courseId: (note as any).courseId,
        semester: note.semester,
        semesterId: (note as any).semesterId,
        subject: note.subject,
        subjectId: (note as any).subjectId,
        unit: note.unit,
        pdfUrl: note.pdfUrl,
        playlistUrl: note.playlistUrl,
        noteType: note.noteType,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        needsReview: (note as any).needsReview === true,
    };

    try {
        let res = await apiFetch<Note>('/share-note', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });

        if (res.success && res.data) {
            return { ok: true, note: res.data };
        }

        res = await apiFetch<Note>('/notes/publish', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });

        if (res.success && res.data) {
            return { ok: true, note: res.data };
        }

        return {
            ok: false,
            message: res.message || 'Server could not publish your note.',
        };
    } catch (error) {
        return {
            ok: false,
            message: 'Cannot reach the server. Start it with npm run server and try again.',
        };
    }
}

export async function syncUnpublishedNotes(
    notes: Note[],
    markPublished: (id: string) => Promise<void>
): Promise<{ synced: number; failed: number }> {
    const token = await getToken();
    if (!token) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const note of notes.filter((item) => !item.isPublished)) {
        const result = await publishCommunityNote(note);
        if (result.ok) {
            await markPublished(note.id);
            synced += 1;
        } else {
            failed += 1;
            console.warn('[syncUnpublishedNotes] failed for', note.id, result.message);
        }
    }

    return { synced, failed };
}
