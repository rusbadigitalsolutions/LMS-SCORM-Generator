import React, { useState } from 'react';
import { 
  Cloud, 
  Key, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Database,
  Image as ImageIcon
} from 'lucide-react';
import { CloudAccountSettings } from '../../types/cloud';

interface CloudAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CloudAccountSettings;
  onSave: (newSettings: CloudAccountSettings) => void;
}

export const CloudAccountsModal: React.FC<CloudAccountsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<CloudAccountSettings>(settings);
  const [activeTab, setActiveTab] = useState<'google' | 'dropbox' | 'cloudinary' | 'ai'>('google');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cloud Storage & API Accounts</h2>
              <p className="text-xs text-slate-400">
                Connect your own Google Drive, Dropbox, Cloudinary, or AI API Keys (Bring-Your-Own-Account)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'google', label: 'Google Drive & Docs', icon: Cloud },
            { id: 'dropbox', label: 'Dropbox', icon: Database },
            { id: 'cloudinary', label: 'Cloudinary CDN', icon: ImageIcon },
            { id: 'ai', label: 'AI Model / API Keys', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 flex-1">
          {/* Tab 1: Google Drive & Docs */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-200">
                <strong>Google Account Connection:</strong> You can import Google Docs directly via public share links OR authenticate your own Google account via personal Access Token or OAuth Client ID.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google Access Token (Optional for private Drive files)
                </label>
                <input
                  type="password"
                  value={form.google.accessToken}
                  onChange={(e) => setForm({
                    ...form,
                    google: { ...form.google, accessToken: e.target.value, connected: Boolean(e.target.value) }
                  })}
                  placeholder="ya29.a0..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Any Google Doc with "Anyone with the link can view" can be imported instantly in Step 1 without requiring an access token!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google OAuth Client ID (For Desktop / Electron App builds)
                </label>
                <input
                  type="text"
                  value={form.google.clientId}
                  onChange={(e) => setForm({
                    ...form,
                    google: { ...form.google, clientId: e.target.value }
                  })}
                  placeholder="1234567890-example.apps.googleusercontent.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Dropbox */}
          {activeTab === 'dropbox' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-200">
                <strong>Dropbox Cloud Connection:</strong> The app supports direct importing of markdown, txt, and docx documents from Dropbox shared links (auto-converts to raw download streams).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dropbox Personal Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={form.dropbox.accessToken}
                  onChange={(e) => setForm({
                    ...form,
                    dropbox: { ...form.dropbox, accessToken: e.target.value, connected: Boolean(e.target.value) }
                  })}
                  placeholder="sl.B..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Allows direct querying of private user directories from Dropbox API.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Cloudinary */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-200">
                <strong>Cloudinary Streaming Architecture:</strong> Cloudinary hosts your high-resolution video briefings and diagrams, delivering adaptive bitrate streaming while keeping your SCORM ZIP package under 1MB.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cloudinary Cloud Name
                </label>
                <input
                  type="text"
                  value={form.cloudinary.cloudName}
                  onChange={(e) => setForm({
                    ...form,
                    cloudinary: { ...form.cloudinary, cloudName: e.target.value }
                  })}
                  placeholder="e.g., demo or your-cloud-name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Upload Preset (Unsigned for direct in-app uploads)
                </label>
                <input
                  type="text"
                  value={form.cloudinary.uploadPreset}
                  onChange={(e) => setForm({
                    ...form,
                    cloudinary: { ...form.cloudinary, uploadPreset: e.target.value }
                  })}
                  placeholder="e.g., scorm_media_preset"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 4: AI Model / API Keys */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-xs text-emerald-200">
                <strong>Bring-Your-Own-Key (BYOK):</strong> When packaging or deploying this desktop app, learners or instructors can plug in their own Cloud AI key (Gemini, OpenAI, Anthropic, Groq) or local Ollama server.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Provider
                  </label>
                  <select
                    value={form.customAi.provider}
                    onChange={(e) => setForm({
                      ...form,
                      customAi: { ...form.customAi, provider: e.target.value as any }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                    <option value="groq">Groq (Llama 3)</option>
                    <option value="ollama">Ollama (Local Desktop)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={form.customAi.model}
                    onChange={(e) => setForm({
                      ...form,
                      customAi: { ...form.customAi, model: e.target.value }
                    })}
                    placeholder="gemini-3.8-flash"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  value={form.customAi.apiKey}
                  onChange={(e) => setForm({
                    ...form,
                    customAi: { ...form.customAi, apiKey: e.target.value }
                  })}
                  placeholder="AI Studio / Cloud API Key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {form.customAi.provider === 'ollama' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ollama Base URL
                  </label>
                  <input
                    type="text"
                    value={form.customAi.baseUrl}
                    onChange={(e) => setForm({
                      ...form,
                      customAi: { ...form.customAi, baseUrl: e.target.value }
                    })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-emerald-400">
            {savedNotice && <span className="flex items-center gap-1 font-bold"><Check className="w-4 h-4" /> Cloud settings saved</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              Save Cloud Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
