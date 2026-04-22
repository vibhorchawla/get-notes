export interface Note {
    id: string;
    title: string;
    content: string;
    subject?: string;
    unit?: string;
    pdfUrl?: string;
    playlistUrl?: string;
    noteType?: 'pdf' | 'playlist' | 'mixed' | 'text';
    createdAt: string;
    updatedAt: string;
}
