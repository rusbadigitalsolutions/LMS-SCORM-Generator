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
              <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-slate-900 border border-purple-800/40 rounded-xl p-4 text-xs text-slate-200">
                <div className="flex items-center gap-2 font-bold text-white mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Bring-Your-Own-Key (BYOK) & Multi-Model Engine</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Connect your choice of cloud AI provider. With <strong>OpenRouter</strong>, you can access dozens of high-performance models (including <strong>100% free models</strong> like Llama 3.3 70B and Gemini 2.0 Flash) with a single API key.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    AI Provider
                  </label>
                  <select
                    value={form.customAi.provider}
                    onChange={(e) => {
                      const prov = e.target.value as any;
                      let defaultModel = form.customAi.model;
                      if (prov === 'openrouter') defaultModel = 'meta-llama/llama-3.3-70b-instruct';
                      else if (prov === 'gemini') defaultModel = 'gemini-2.5-flash';
                      else if (prov === 'groq') defaultModel = 'llama-3.3-70b-versatile';
                      else if (prov === 'openai') defaultModel = 'gpt-4o';
                      else if (prov === 'anthropic') defaultModel = 'claude-3-5-sonnet-20241022';
                      else if (prov === 'ollama') defaultModel = 'llama3';

                      setForm({
                        ...form,
                        customAi: {
                          ...form.customAi,
                          provider: prov,
                          model: defaultModel,
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="openrouter">OpenRouter (100+ Models & Free Tier)</option>
                    <option value="gemini">Google Gemini API</option>
                    <option value="groq">Groq (Ultra-Fast Free Tier)</option>
                    <option value="openai">OpenAI (GPT-4o / o1)</option>
                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                    <option value="ollama">Ollama (Local Desktop Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Model Identifier</span>
                    {form.customAi.provider === 'openrouter' && (
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Free models available</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.customAi.model}
                    onChange={(e) => setForm({
                      ...form,
                      customAi: { ...form.customAi, model: e.target.value }
                    })}
                    placeholder={form.customAi.provider === 'openrouter' ? 'meta-llama/llama-3.3-70b-instruct' : 'gemini-2.5-flash'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Quick Model Presets for OpenRouter matching user's key */}
              {form.customAi.provider === 'openrouter' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Models on your OpenRouter Account:</span>
                    <a
                      href="https://openrouter.ai/models"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Browse all models <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Llama 3.3 70B', id: 'meta-llama/llama-3.3-70b-instruct', badge: 'RECOMMENDED' },
                      { label: 'Nemotron 3.5 Lightning', id: 'nvidia/nemotron-3.5-lightning:free', badge: 'FREE' },
                      { label: 'North Mini Code', id: 'cohere/north-mini-code:free', badge: 'FREE' },
                      { label: 'Nemotron 3 Nano Omni', id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', badge: 'FREE' },
                      { label: 'Nemotron 3 Ultra', id: 'nvidia/nemotron-3-ultra-550b-a55b:free', badge: 'FREE' },
                      { label: 'LFM 2.5', id: 'liquid/lfm-2.5-2.6b:free', badge: 'FREE' },
                      { label: 'Nemotron 3.5 Super VL', id: 'nvidia/nemotron-3.5-super-vl:free', badge: 'FREE' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          customAi: { ...form.customAi, model: m.id }
                        })}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all ${
                          form.customAi.model === m.id
                            ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{m.label}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                          m.badge === 'FREE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {m.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {form.customAi.provider === 'openrouter' ? 'OpenRouter API Key *' : 'API Key *'}
                  </label>
                  {form.customAi.provider === 'openrouter' && (
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Get your key at openrouter.ai/keys <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {form.customAi.provider === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Get key at console.groq.com <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={form.customAi.apiKey}
                  onChange={(e) => setForm({
                    ...form,
                    customAi: { ...form.customAi, apiKey: e.target.value }
                  })}
                  placeholder={
                    form.customAi.provider === 'openrouter' 
                      ? 'sk-or-v1-...' 
                      : form.customAi.provider === 'groq'
                      ? 'gsk_...'
                      : 'Enter your API key'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              {form.customAi.provider === 'ollama' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ollama Base URL (Local Machine)
                  </label>
                  <input
                    type="text"
                    value={form.customAi.baseUrl}
                    onChange={(e) => setForm({
                      ...form,
                      customAi: { ...form.customAi, baseUrl: e.target.value }
                    })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
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
