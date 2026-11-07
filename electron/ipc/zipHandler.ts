import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ipcMain } from 'electron';

export function registerZipHandlers() {
  ipcMain.handle('workspace:export-zip', async (_, { projectPath, zipName }) => {
    try {
      const zip = new JSZip();

      const manifestPath = path.join(projectPath, 'imsmanifest.xml');
      const htmlPath = path.join(projectPath, 'index.html');
      const jsPath = path.join(projectPath, 'js', 'scormAPI.js');

      if (!fs.existsSync(manifestPath) || !fs.existsSync(htmlPath)) {
        throw new Error('Project missing core index.html or imsmanifest.xml files');
      }

      // Add files directly to root of ZIP (critical for SCORM LMS compliance)
      zip.file('imsmanifest.xml', fs.readFileSync(manifestPath));
      zip.file('index.html', fs.readFileSync(htmlPath));
      if (fs.existsSync(jsPath)) {
        zip.file('js/scormAPI.js', fs.readFileSync(jsPath));
      }

      const content = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      const outputZipPath = path.join(projectPath, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
      fs.writeFileSync(outputZipPath, content);
      return outputZipPath;
    } catch (err: any) {
      console.error('ZIP generation failed:', err);
      throw new Error(`Failed to generate SCORM package: ${err.message}`);
    }
  });
}
