export interface NoteUploader {
    id: string;
    name: string;
    course?: string;
    branch?: string;
    college?: string;
    avatar?: string;
}

export interface Note {
    id: string;
    title: string;
    description?: string;
    content?: string;
    subject?: string;
    subjectId?: string;
    unit?: string;
    pdfUrl?: string;
    thumbnail?: string;
    playlistUrl?: string;
    noteType?: 'pdf' | 'drive' | 'playlist' | 'mixed' | 'text';
    course?: string;
    courseId?: string;
    semester?: number;
    semesterId?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    uploadedBy?: NoteUploader;
    uploaderId?: string;
    uploaderName?: string;
    uploaderCollege?: string;
    uploaderAvatar?: string;
    uploaderBranch?: string;
    source?: 'course' | 'community' | 'upload';
    isPublished?: boolean;
    isPremium?: boolean;
    isVerified?: boolean;
    isFeatured?: boolean;
    downloads?: number;
    views?: number;
    saves?: number;
    likes?: number;
    likedBy?: string[];
    averageRating?: number;
    ratingCount?: number;
    reportCount?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'flagged';
}

export interface Course {
    id: string;
    name: string;
    icon: string;
    category?: string;
    isActive?: boolean;
    _id?: string;
}

export interface Semester {
    id: string;
    number: number;
    courseId: string;
    isActive?: boolean;
    _id?: string;
}

export interface Subject {
    id: string;
    name: string;
    semesterId: string;
    noteCount: number;
    icon?: string;
    isActive?: boolean;
    _id?: string;
}

export interface College {
    id: string;
    name: string;
    city?: string;
    state?: string;
    noteCount: number;
    contributorCount: number;
}

export interface UserReputation {
    id: string;
    userId: string;
    points: number;
    rank: number;
    totalUploads: number;
    totalDownloads: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
    reportsReceived: number;
    badges: Array<{ name: string; earnedAt: string }>;
    currentBadge: { name: string; minPoints: number };
}

export interface UserStats {
    saved: number;
    downloads: number;
    notesRead: number;
    uploaded: number;
    totalUploads: number;
    downloadsReceived: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
    reputationPoints: number;
    badge: string;
    rank: number;
}

export function noteMatchesSearch(note: Note, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return [
        note.title,
        note.description,
        note.content,
        note.subject,
        note.unit,
        note.course,
        ...(note.tags || []),
        note.uploadedBy?.name,
        note.uploadedBy?.course,
        note.uploaderName,
        note.uploaderCollege,
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
}

export const BADGE_LEVELS = [
    { name: '🌟 Beginner', minPoints: 0 },
    { name: '📘 Contributor', minPoints: 100 },
    { name: '🏆 Top Contributor', minPoints: 500 },
    { name: '👑 Elite Contributor', minPoints: 2000 },
];

export function getBadgeForPoints(points: number): { name: string; minPoints: number } {
    let badge = BADGE_LEVELS[0];
    for (const level of BADGE_LEVELS) {
        if (points >= level.minPoints) {
            badge = level;
        }
    }
    return badge;
}
