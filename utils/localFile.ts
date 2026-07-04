import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export function isLocalFileUrl(url?: string | null): boolean {
    if (!url) return false;
    return url.startsWith('file://') || url.startsWith('content://');
}

export function isRemoteUrl(url?: string | null): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
}

export function normalizePdfUrl(pdfUrl?: string | string[] | null): string {
    const value = Array.isArray(pdfUrl) ? pdfUrl[0] : pdfUrl;
    if (!value) return '';

    if (isLocalFileUrl(value)) {
        return value;
    }

    // Keep http for local dev servers (e.g. http://192.168.1.7:5000/api/files/...)
    if (value.startsWith('http://')) {
        const isLocalNetwork =
            /^http:\/\/(192\.168\.|10\.|127\.|localhost)/i.test(value) ||
            value.includes(':5000/');
        if (!isLocalNetwork) {
            return value.replace('http://', 'https://');
        }
    }

    return value;
}

export async function openLocalFile(fileUri: string): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            const contentUri = await FileSystem.getContentUriAsync(fileUri);
            await Linking.openURL(contentUri);
            return true;
        }

        const canOpen = await Linking.canOpenURL(fileUri);
        if (canOpen) {
            await Linking.openURL(fileUri);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[openLocalFile]', error);
        return false;
    }
}

export type LocalPdfWebSource = { html: string; baseUrl?: string };

function buildPdfJsViewerHtml(base64: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f1f5f9; }
  #status { padding: 24px 16px; text-align: center; color: #64748b; font-family: sans-serif; }
  #pages { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 12px 32px; }
  canvas { width: 100% !important; height: auto !important; background: #fff; box-shadow: 0 4px 16px rgba(15,23,42,0.08); border-radius: 8px; }
</style>
</head>
<body>
<div id="status">Loading PDF...</div>
<div id="pages"></div>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const raw = atob('${base64}');
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  pdfjsLib.getDocument({ data: bytes }).promise.then(async function(pdf) {
    document.getElementById('status').style.display = 'none';
    const container = document.getElementById('pages');
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    }
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('loaded');
  }).catch(function() {
    document.getElementById('status').textContent = 'Could not render this PDF.';
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('error');
  });
</script>
</body>
</html>`;
}

export async function getLocalPdfWebSource(fileUri: string): Promise<LocalPdfWebSource | null> {
    try {
        const info = await FileSystem.getInfoAsync(fileUri);
        if (!info.exists) {
            console.warn('[getLocalPdfWebSource] file missing:', fileUri);
            return null;
        }

        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return { html: buildPdfJsViewerHtml(base64) };
    } catch (error) {
        console.error('[getLocalPdfWebSource]', error);
        return null;
    }
}

export function getRemotePdfWebSource(pdfUrl: string, useGoogleViewer: boolean) {
    if (useGoogleViewer) {
        return {
            uri: `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`,
        };
    }
    return { uri: pdfUrl };
}
