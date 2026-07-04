export interface NoteUploader {
    id: string;
    name: string;
    course?: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    subject?: string;
    unit?: string;
    pdfUrl?: string;
    playlistUrl?: string;
    noteType?: 'pdf' | 'drive' | 'playlist' | 'mixed' | 'text';
    createdAt: string;
    updatedAt: string;
    uploadedBy?: NoteUploader;
    source?: 'course' | 'community' | 'upload';
    courseId?: string;
    /** True after the note is published to the server for global search */
    isPublished?: boolean;
}

export function noteMatchesSearch(note: Note, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return [
        note.title,
        note.content,
        note.subject,
        note.unit,
        note.pdfUrl,
        note.playlistUrl,
        note.uploadedBy?.name,
        note.uploadedBy?.course,
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
}
