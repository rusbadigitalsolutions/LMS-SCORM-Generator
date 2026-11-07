import React, { useState } from 'react';
import { 
  Laptop, 
  Monitor, 
  Terminal, 
  Download, 
  Check, 
  Copy, 
  X, 
  ExternalLink,
  Sparkles,
  Layers,
  FolderGit2
} from 'lucide-react';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How to Test & Install on Your Desktop</h2>
              <p className="text-xs text-slate-400">Two flexible methods: 1-Click Desktop PWA or Local Electron Desktop App</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Method 1: Instant Browser Desktop PWA */}
          <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-800/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
                <h3 className="text-base font-bold text-white">Instant 1-Click Desktop App (PWA)</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Easiest &bull; No Terminal Required
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You can install this app directly as a standalone desktop application on <strong>Windows</strong>, <strong>macOS</strong>, or <strong>Linux</strong> right from your browser:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-white block mb-1">Google Chrome</strong>
                <p className="text-slate-400 text-[11px]">
                  Click the <strong>Install icon</strong> (<span className="text-blue-400">⊕</span>) on the right side of the URL address bar, or click Menu (<span className="text-blue-400">&vellip;</span>) &rarr; <em>Save and share</em> &rarr; <strong>Install page as app</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-white block mb-1">Microsoft Edge</strong>
                <p className="text-slate-400 text-[11px]">
                  Click the <strong>App Available</strong> icon in the address bar, or click Menu (&hellip;) &rarr; <em>Apps</em> &rarr; <strong>Install LMS SCORM Generator</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-white block mb-1">macOS Safari</strong>
                <p className="text-slate-400 text-[11px]">
                  Click <em>File</em> &rarr; <strong>Add to Dock</strong> to place an icon in your macOS Dock that runs as a clean desktop window.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launches in its own native desktop window with desktop shortcut and taskbar icon!</span>
            </div>
          </div>

          {/* Method 2: Local Electron Desktop Shell */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">2</span>
                <h3 className="text-base font-bold text-white">Run as a Local Electron Desktop App</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Developer &bull; Native Binaries
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The project is already pre-configured with the Electron architecture (<code>electron/main.ts</code>, <code>electron/preload.ts</code>, and <code>electron/ipc/zipHandler.ts</code>).
            </p>

            {/* Step-by-step terminal commands */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[11px] text-slate-400 mb-1 font-sans font-semibold">
                  Step 1: Download or clone the codebase to your local computer and install dependencies:
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-slate-200">
                  <code>npm install</code>
                  <button
                    onClick={() => copyCode('npm install', 'c1')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1 font-sans font-semibold">
                  Step 2: Start the server & local development environment:
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-slate-200">
                  <code>npm run dev</code>
                  <button
                    onClick={() => copyCode('npm run dev', 'c2')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1 font-sans font-semibold">
                  Step 3: Launch in an Electron Desktop Window:
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-slate-200">
                  <code>npx electron .</code>
                  <button
                    onClick={() => copyCode('npx electron .', 'c3')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'c3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1 font-sans font-semibold">
                  Step 4: Package into an executable installer (.exe on Windows, .dmg on macOS):
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-slate-200">
                  <code>npx electron-builder</code>
                  <button
                    onClick={() => copyCode('npx electron-builder', 'c4')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'c4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
