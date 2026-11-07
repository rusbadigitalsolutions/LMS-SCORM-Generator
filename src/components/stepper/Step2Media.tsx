import React, { useState } from 'react';
import { 
  ImageIcon, 
  Video, 
  Music, 
  Code2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight, 
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { MediaAsset } from '../../types/scorm';

interface Step2MediaProps {
  mediaAssets: MediaAsset[];
  setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  onNext: () => void;
  onPrev: () => void;
  totalScreens: number;
}

export const Step2Media: React.FC<Step2MediaProps> = ({
  mediaAssets,
  setMediaAssets,
  onNext,
  onPrev,
  totalScreens,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'video' | 'image' | 'audio' | 'embed'>('image');
  const [newCaption, setNewCaption] = useState('');
  const [newScreen, setNewScreen] = useState<number>(0); // 0 = Auto-Align

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const asset: MediaAsset = {
      id: 'media-' + Date.now(),
      url: newUrl.trim(),
      type: newType,
      caption: newCaption.trim() || (newType === 'video' ? 'Operational Briefing' : 'Architecture Diagram'),
      targetScreen: newScreen,
    };

    setMediaAssets([...mediaAssets, asset]);
    setNewUrl('');
    setNewCaption('');
    setNewScreen(0);
  };

  const handleRemoveAsset = (id: string) => {
    setMediaAssets(mediaAssets.filter((a) => a.id !== id));
  };

  const addPresetAsset = (preset: { url: string; type: 'video' | 'image'; caption: string }) => {
    const asset: MediaAsset = {
      id: 'media-' + Date.now(),
      url: preset.url,
      type: preset.type,
      caption: preset.caption,
      targetScreen: 3,
    };
    setMediaAssets([...mediaAssets, asset]);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <ImageIcon className="w-3.5 h-3.5" />
          Step 2: Media & Cloudinary URLs
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cloud & Local Media Asset Manager
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Attach Cloudinary HTTPS streaming videos, high-resolution infographics, or audio podcasts. Remote links keep the SCORM ZIP package ultra-light while remaining 100% compliant.
        </p>
      </div>

      {/* Cloudinary Best Practice Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-800/60 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-lg">
        <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            Cloudinary & HTTPS Asset Optimization
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Directly embedding Cloudinary URLs in &lt;video&gt; and &lt;img&gt; tags eliminates massive multi-hundred megabyte SCORM ZIP packages. All diagrams automatically inherit responsive <strong>Lightbox Modal Zoom</strong>!
          </p>
        </div>
      </div>

      {/* Add New Asset Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Add Media Asset
        </h2>

        <form onSubmit={handleAddAsset} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="image">Infographic / Diagram (Image)</option>
                <option value="video">MP4 Video (Cloudinary / CDN)</option>
                <option value="audio">MP3 Audio</option>
                <option value="embed">Interactive Embed</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Media URL or Path *</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/demo/image/upload/sample.jpg"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Placement</label>
              <select
                value={newScreen}
                onChange={(e) => setNewScreen(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value={0}>Auto-Align via AI</option>
                {Array.from({ length: Math.max(6, totalScreens) }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Screen {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="w-full sm:w-2/3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Figure Caption / Accessibility Label
              </label>
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="e.g., Figure 2.1: Distributed Governance Flowchart"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newUrl.trim()}
              className="w-full sm:w-auto mt-4 sm:mt-5 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add Asset to Deck
            </button>
          </div>
        </form>

        {/* Quick presets */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick CDN Presets:</span>
          <button
            type="button"
            onClick={() => addPresetAsset({
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
              type: 'image',
              caption: 'Architecture Matrix & Operational Guardrails (High-Res)',
            })}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            + Architecture Matrix Image
          </button>

          <button
            type="button"
            onClick={() => addPresetAsset({
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              type: 'video',
              caption: 'Briefing Video: Incident Response Protocols',
            })}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            + Briefing MP4 Video
          </button>
        </div>
      </div>

      {/* Asset Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Configured Media Assets ({mediaAssets.length})
          </h2>
          <span className="text-xs text-slate-500">
            {mediaAssets.length === 0 ? 'No assets added yet (SVG illustrations will be generated)' : 'Registered for imsmanifest.xml & index.html'}
          </span>
        </div>

        {mediaAssets.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No media assets specified</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You can proceed without media. The lesson generator will render high-contrast diagrams, concept cards, and CSS charts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mediaAssets.map((asset, idx) => (
              <div
                key={asset.id}
                className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                    {asset.type === 'video' ? (
                      <Video className="w-5 h-5 text-indigo-400" />
                    ) : asset.type === 'audio' ? (
                      <Music className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {asset.caption}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {asset.type}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {asset.targetScreen === 0 ? 'Auto-Align' : `Screen ${asset.targetScreen}`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-lg mt-0.5">
                      {asset.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Open asset in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    title="Remove asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
        >
          <span>Continue to Architecture & Directives</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
