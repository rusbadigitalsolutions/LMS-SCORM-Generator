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

declare global {
  interface Window {
    scormStudioAPI?: ScormStudioAPI;
  }
}
