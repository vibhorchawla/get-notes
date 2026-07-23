import { getToken, apiFetch } from './useApi';
import { Note } from '../types/note';

export type PublishResult = {
    ok: boolean;
    message?: string;
};

export async function publishCommunityNote(note: Note): Promise<PublishResult> {
    const token = await getToken();
    if (!token) {
        return {
            ok: false,
            message: 'Sign in required so other students can search your notes.',
        };
    }

    const payload = {
        id: note.id,
        title: note.title,
        content: note.content,
        course: note.course,
        semester: note.semester,
        subject: note.subject,
        unit: note.unit,
        pdfUrl: note.pdfUrl,
        playlistUrl: note.playlistUrl,
        noteType: note.noteType,
        tags: note.tags,
        uploadedBy: note.uploadedBy,
        uploaderName: note.uploaderName,
        uploaderCollege: note.uploaderCollege,
        uploaderAvatar: note.uploaderAvatar,
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

        if (res.success) {
            return { ok: true };
        }

        res = await apiFetch<Note>('/notes/publish', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });

        if (res.success) {
            return { ok: true };
        }

        return {
            ok: false,
            message: res.message || 'Server could not publish your note.',
        };
    } catch (error) {
        console.error('publishCommunityNote error:', error);
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
