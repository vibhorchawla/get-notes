const DRIVE_HOST_PATTERN = /drive\.google\.com/i;

export function extractDriveFileId(url: string): string | null {
    const trimmed = url.trim();
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /\/uc\?(?:export=[^&]+&)?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match?.[1]) return match[1];
    }

    return null;
}

export function isGoogleDriveLink(url: string): boolean {
    return DRIVE_HOST_PATTERN.test(url.trim()) && Boolean(extractDriveFileId(url));
}

export function toDriveViewUrl(url: string): string {
    const fileId = extractDriveFileId(url);
    if (!fileId) return url.trim();
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function toDriveShareUrl(url: string): string {
    const fileId = extractDriveFileId(url);
    if (!fileId) return url.trim();
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

export function isDriveStoredUrl(url?: string): boolean {
    if (!url) return false;
    return DRIVE_HOST_PATTERN.test(url);
}
