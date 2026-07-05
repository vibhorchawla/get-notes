import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { getToken, removeToken, refreshToken } from './useApi';
import { API_BASE_URL } from './config';

export interface PickedDriveFile {
    name: string;
    uri?: string;
    driveFileId?: string;
    shareUrl?: string;
    viewUrl?: string;
    uploadedUrl?: string;
}

export type UploadResult =
    | { ok: true; url: string; name: string }
    | { ok: false; message: string };

export async function pickFileFromDevice(): Promise<PickedDriveFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
        type: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.google-apps.document',
            'image/*',
        ],
        copyToCacheDirectory: true,
        multiple: false,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    return {
        name: asset.name,
        uri: asset.uri,
    };
}

export async function persistPickedFile(localUri: string, fileName: string): Promise<string> {
    const uploadsDir = `${FileSystem.documentDirectory}uploads/`;
    const dirInfo = await FileSystem.getInfoAsync(uploadsDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(uploadsDir, { intermediates: true });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destination = `${uploadsDir}${Date.now()}-${safeName}`;
    await FileSystem.copyAsync({ from: localUri, to: destination });
    return destination;
}

function guessMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    if (extension === 'pdf') return 'application/pdf';
    if (extension === 'png') return 'image/png';
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
    if (extension === 'doc') return 'application/msword';
    if (extension === 'docx') {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    return 'application/octet-stream';
}

export async function uploadFileToServer(
    localUri: string,
    fileName: string
): Promise<UploadResult> {
    let token = await getToken();
    if (!token) {
        return { ok: false, message: 'Sign in to upload files to the server.' };
    }

    const uploadUrl = `${API_BASE_URL}/files/upload`;
    const mimeType = guessMimeType(fileName);

    const doUpload = async (authToken: string) => {
        return FileSystem.uploadAsync(uploadUrl, localUri, {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            mimeType,
            headers: { Authorization: `Bearer ${authToken}` },
        });
    };

    try {
        let response = await doUpload(token);

        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
                token = refreshed;
                response = await doUpload(refreshed);
            }
        }

        let json: { success?: boolean; data?: { url?: string; name?: string }; message?: string };
        try {
            json = JSON.parse(response.body);
        } catch {
            return {
                ok: false,
                message:
                    response.status >= 400
                        ? `Server error (${response.status}). Restart the API with npm run server.`
                        : 'Invalid server response while uploading.',
            };
        }

        if (response.status >= 200 && response.status < 300 && json.success && json.data?.url) {
            return {
                ok: true,
                url: json.data.url,
                name: json.data.name || fileName,
            };
        }

        if (response.status === 401) {
            await removeToken();
            return { ok: false, message: 'Session expired. Please sign in again.' };
        }

        return {
            ok: false,
            message:
                json.message ||
                (response.status === 404
                    ? 'Upload route not found. Restart the API (npm run server).'
                    : `Upload failed (${response.status}).`),
        };
    } catch (error) {
        console.error('uploadFileToServer error:', error);
        return {
            ok: false,
            message:
                'Could not reach the server. Use the same Wi‑Fi and run npm run server on your PC.',
        };
    }
}
