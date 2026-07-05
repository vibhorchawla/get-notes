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

const FAST_DECODE_SCRIPT = `
var b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var lookup=new Uint8Array(128);for(var i=0;i<64;i++)lookup[b64.charCodeAt(i)]=i;
function decode64(s){var len=s.length,bytes=new Uint8Array(len*3/4);var p=0;
for(var i=0;i<len;i+=4){var c1=lookup[s.charCodeAt(i)],c2=lookup[s.charCodeAt(i+1)];
var c3=lookup[s.charCodeAt(i+2)],c4=lookup[s.charCodeAt(i+3)];
bytes[p++]=c1<<2|c2>>4;bytes[p++]=(c2&15)<<4|c3>>2;
if(c3!==64)bytes[p++]=(c3&3)<<6|c4;if(c4!==64)bytes[p++]=c4;}
return bytes.slice(0,p);}
`;

function buildPdfJsViewerHtml(base64: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=4,user-scalable=yes"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f1f5f9}
#p{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px}
canvas{width:100%!important;height:auto!important;background:#fff;border-radius:4px}</style></head>
<body><div id="p"></div><script>
${FAST_DECODE_SCRIPT}
function post(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m))}
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
var bytes=decode64('${base64}');
pdfjsLib.getDocument({data:bytes,rangeChunkSize:131072,disableAutoFetch:true,disableStream:true}).promise.then(function(pdf){
post({type:'progress',total:pdf.numPages,loaded:0});
var ct=document.getElementById('p'),done=0,batch=8;
function renderBatch(s){var ps=[];
for(var n=s;n<Math.min(s+batch,pdf.numPages+1);n++){(function(pn){
ps.push(pdf.getPage(pn).then(function(pg){
var v=pg.getViewport({scale:1}),c=document.createElement('canvas');
c.width=v.width;c.height=v.height;ct.appendChild(c);
return pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise.then(function(){
done++;post({type:'progress',total:pdf.numPages,loaded:done});});}));
})(n);}Promise.all(ps).then(function(){s+batch<=pdf.numPages?renderBatch(s+batch):post({type:'loaded'})});}
renderBatch(1);
}).catch(function(e){post({type:'error',message:String(e)})});
</script></body></html>`;
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

function buildRemotePdfViewerHtml(pdfUrl: string): string {
    const escapedUrl = pdfUrl.replace(/'/g, "\\'").replace(/\n/g, "\\n");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=4,user-scalable=yes"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f1f5f9;overflow-x:hidden}
#p{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px}
canvas{width:100%!important;height:auto!important;background:#fff;border-radius:4px}</style></head>
<body><div id="p"></div><script>
function post(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m))}
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
pdfjsLib.getDocument({url:'${escapedUrl}',withCredentials:false,rangeChunkSize:65536,disableAutoFetch:false,disableStream:false}).promise.then(function(pdf){
post({type:'progress',total:pdf.numPages,loaded:0});
var ct=document.getElementById('p'),done=0,batch=8;
function renderBatch(s){var ps=[];
for(var n=s;n<Math.min(s+batch,pdf.numPages+1);n++){(function(pn){
ps.push(pdf.getPage(pn).then(function(pg){
var v=pg.getViewport({scale:1}),c=document.createElement('canvas');
c.width=v.width;c.height=v.height;ct.appendChild(c);
return pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise.then(function(){
done++;post({type:'progress',total:pdf.numPages,loaded:done});});}));
})(n);}Promise.all(ps).then(function(){s+batch<=pdf.numPages?renderBatch(s+batch):post({type:'loaded'})});}
renderBatch(1);
}).catch(function(e){post({type:'error',message:String(e)})});
</script></body></html>`;
}

export function getRemotePdfWebSource(pdfUrl: string): LocalPdfWebSource {
    return { html: buildRemotePdfViewerHtml(pdfUrl) };
}
