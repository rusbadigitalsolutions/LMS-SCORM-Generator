import JSZip from 'jszip';
import { ScormPackageFiles } from '../types/scorm';

/**
 * Creates a valid SCORM ZIP package with imsmanifest.xml and index.html at root,
 * and js/scormAPI.js in the js folder.
 */
export async function createScormZipBlob(files: ScormPackageFiles): Promise<Blob> {
  const zip = new JSZip();

  // 1. imsmanifest.xml MUST be at the absolute root of the ZIP
  if (files['imsmanifest.xml']) {
    zip.file('imsmanifest.xml', files['imsmanifest.xml']);
  }

  // 2. index.html at root
  if (files['index.html']) {
    zip.file('index.html', files['index.html']);
  }

  // 3. js/scormAPI.js in the js/ subfolder
  if (files['js/scormAPI.js']) {
    zip.file('js/scormAPI.js', files['js/scormAPI.js']);
  }

  // 4. source_context.json (optional metadata)
  if (files['source_context.json']) {
    zip.file('source_context.json', files['source_context.json']);
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Helper to trigger browser file download of a Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Helper to download raw text as a file
 */
export function triggerTextDownload(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  triggerBlobDownload(blob, filename);
}
