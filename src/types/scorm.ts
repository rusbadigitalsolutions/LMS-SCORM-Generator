export type ScormStandard = '1.2' | '2004';
export type LayoutMode = 'no-scroll' | 'scroll';

export type GamificationPattern = 
  | 'pill-classifier'
  | 'decision-simulator'
  | 'perceptual-radar';

export interface MediaAsset {
  id: string;
  url: string;
  type: 'video' | 'image' | 'audio' | 'embed';
  caption: string;
  targetScreen: number; // 0 for auto-align, 1..N for specific screen
}

export interface GeneratorSettings {
  scormVersion: ScormStandard;
  layout: LayoutMode;
  targetScreens: number; // e.g. 5, 6, 7
  gamification: boolean;
  selectedPatterns: GamificationPattern[];
  lightbox: boolean;
  customInstructions: string;
  theme: 'slate-dark' | 'clean-light' | 'navy-tech';
}

export interface ScormPackageFiles {
  'index.html': string;
  'imsmanifest.xml': string;
  'js/scormAPI.js': string;
  'source_context.json'?: string;
}

export interface ScormProject {
  id: string;
  courseTitle: string;
  courseSlug: string;
  moduleBadge: string;
  lessonTitle: string;
  lessonContent: string;
  mediaAssets: MediaAsset[];
  settings: GeneratorSettings;
  files: ScormPackageFiles;
  status: 'draft' | 'generated' | 'validated' | 'zipped';
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  action: 'LMSInitialize' | 'LMSSetValue' | 'LMSGetValue' | 'LMSCommit' | 'LMSFinish' | 'Initialize' | 'SetValue' | 'GetValue' | 'Commit' | 'Terminate';
  param: string;
  result: string;
  element?: string;
  value?: string;
}

export interface CmiState {
  lesson_status: string;
  lesson_location: string;
  score_raw: string;
  score_scaled?: string;
  suspend_data: string;
  session_time?: string;
}

export interface ValidationItem {
  id: string;
  name: string;
  category: 'Manifest' | 'Runtime' | 'Layout' | 'Gamification' | 'Media';
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}
