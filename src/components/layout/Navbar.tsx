import React from 'react';
import { 
  Boxes, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Download,
  FolderGit2
} from 'lucide-react';
import { ScormProject } from '../../types/scorm';

interface NavbarProps {
  currentProject: ScormProject | null;
  currentStep: number;
  onNavigateTab: (tab: 'hub' | 'stepper' | 'qa' | 'guide') => void;
  activeTab: 'hub' | 'stepper' | 'qa' | 'guide';
  onNewLesson: () => void;
  onExportZip: () => void;
  onOpenCloudAccounts?: () => void;
  onOpenDesktopInstall?: () => void;
  qaScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onNavigateTab,
  activeTab,
  onNewLesson,
  onExportZip,
  onOpenCloudAccounts,
  onOpenDesktopInstall,
  qaScore,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigateTab('hub')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">LMS SCORM Generator</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SCORM 1.2 &bull; 2004
                </span>
              </div>
              <p className="text-xs text-slate-400">Universal e-Learning Package Studio for LMS</p>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onNavigateTab('hub')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'hub'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Projects Hub
          </button>

          <button
            onClick={() => onNavigateTab('stepper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'stepper'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Lesson Studio
          </button>

          <button
            onClick={() => onNavigateTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'qa'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            LMS QA Auditor
            {typeof qaScore === 'number' && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                qaScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {qaScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigateTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            LMS Upload Guide
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {onOpenDesktopInstall && (
            <button
              onClick={onOpenDesktopInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-all"
              title="Install Desktop App or view local setup commands"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Desktop App</span>
            </button>
          )}

          {onOpenCloudAccounts && (
            <button
              onClick={onOpenCloudAccounts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="Configure Google Drive, Dropbox, Cloudinary, or AI API Keys"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Cloud & Keys</span>
            </button>
          )}

          {currentProject && (
            <button
              onClick={onExportZip}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02]"
              title="Compile and download standard SCORM ZIP package"
            >
              <Download className="w-3.5 h-3.5" />
              Export .ZIP
            </button>
          )}

          <button
            onClick={onNewLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Lesson</span>
          </button>
        </div>
      </div>
    </header>
  );
};
