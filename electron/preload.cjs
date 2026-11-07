/**
 * Electron Preload Script for LMS SCORM Generator Desktop App
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scormStudioAPI', {
  // Directory & Workspace
  selectWorkspaceDir: () => ipcRenderer.invoke('workspace:select-dir'),
  openScormDirectory: () => ipcRenderer.invoke('workspace:open-dir'),
  saveScormProject: (projectPath, files) => 
    ipcRenderer.invoke('workspace:save-files', { projectPath, files }),
  exportScormZip: (projectPath, zipName) => 
    ipcRenderer.invoke('workspace:export-zip', { projectPath, zipName }),

  // File Parsing
  parseLocalFile: (filePath) => ipcRenderer.invoke('file:parse', filePath),

  // Cloud Connectors
  authenticateGoogleDrive: () => ipcRenderer.invoke('drive:auth'),
  fetchDriveFiles: () => ipcRenderer.invoke('drive:list-files'),
  downloadDriveFile: (fileId) => ipcRenderer.invoke('drive:download', fileId),

  // AI Pipeline
  generateScormPackage: (payload) => ipcRenderer.invoke('ai:generate-scorm', payload),

  // Secrets Management
  saveApiKey: (provider, key) => ipcRenderer.invoke('store:save-key', { provider, key }),
  getApiKey: (provider) => ipcRenderer.invoke('store:get-key', provider),

  // Workspace events
  onWorkspaceSelected: (callback) => {
    ipcRenderer.on('workspace:selected', (_, path) => callback(path));
  },
});
