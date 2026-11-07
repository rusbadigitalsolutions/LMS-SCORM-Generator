import { contextBridge, ipcRenderer } from 'electron';

export interface ScormStudioAPI {
  // Directory & Workspace
  selectWorkspaceDir: () => Promise<string | null>;
  openScormDirectory: () => Promise<{ path: string; files: Record<string, string> } | null>;
  saveScormProject: (projectPath: string, files: Record<string, string>) => Promise<boolean>;
  exportScormZip: (projectPath: string, zipName: string) => Promise<string>;

  // File Parsing
  parseLocalFile: (filePath: string) => Promise<{ filename: string; content: string }>;

  // Cloud Connectors
  authenticateGoogleDrive: () => Promise<boolean>;
  fetchDriveFiles: () => Promise<Array<{ id: string; mimeType: string; name: string }>>;
  downloadDriveFile: (fileId: string) => Promise<string>;

  // AI Pipeline
  generateScormPackage: (payload: {
    lessonContent: string;
    mediaAssets: Array<{ url: string; type: string; caption: string; targetScreen?: number }>;
    settings: {
      layout: 'no-scroll' | 'scroll';
      gamification: boolean;
      lightbox: boolean;
      scormVersion: '1.2' | '2004';
      customInstructions?: string;
    };
  }) => Promise<{ html: string; manifest: string; scormJs: string }>;

  // Secrets Management
  saveApiKey: (provider: string, key: string) => Promise<void>;
  getApiKey: (provider: string) => Promise<string | null>;
}

contextBridge.exposeInMainWorld('scormStudioAPI', {
  selectWorkspaceDir: () => ipcRenderer.invoke('workspace:select-dir'),
  openScormDirectory: () => ipcRenderer.invoke('workspace:open-dir'),
  saveScormProject: (projectPath: string, files: Record<string, string>) => 
    ipcRenderer.invoke('workspace:save-files', { projectPath, files }),
  exportScormZip: (projectPath: string, zipName: string) => 
    ipcRenderer.invoke('workspace:export-zip', { projectPath, zipName }),
  parseLocalFile: (filePath: string) => ipcRenderer.invoke('file:parse', filePath),
  authenticateGoogleDrive: () => ipcRenderer.invoke('drive:auth'),
  fetchDriveFiles: () => ipcRenderer.invoke('drive:list-files'),
  downloadDriveFile: (fileId: string) => ipcRenderer.invoke('drive:download', fileId),
  generateScormPackage: (payload: any) => ipcRenderer.invoke('ai:generate-scorm', payload),
  saveApiKey: (provider: string, key: string) => ipcRenderer.invoke('store:save-key', { provider, key }),
  getApiKey: (provider: string) => ipcRenderer.invoke('store:get-key', provider),
});
