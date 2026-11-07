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
  Check, 
  Edit3, 
  X, 
  Save, 
  SlidersHorizontal 
} from 'lucide-react';
import { MediaAsset } from '../../types/scorm';

interface Step2MediaProps {
  mediaAssets: MediaAsset[];
  setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  onNext: () => void;
  onPrev: () => void;
  totalScreens: number;
}

function inferCaptionFromUrl(url: string, type: string): string {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    if (nameWithoutExt && nameWithoutExt.length > 2 && !nameWithoutExt.includes('%')) {
      const readable = nameWithoutExt
        .replace(/[-_+]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      if (readable.length > 2) return readable;
    }
  } catch (e) {
    // fallback
  }
  return type === 'video' ? 'Lesson Video' : type === 'image' ? 'Instructional Infographic' : 'Course Asset';
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
  const [newScreen, setNewScreen] = useState<number>(0); // 0 = Auto-Distribute

  // Editing state for existing assets
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editType, setEditType] = useState<'video' | 'image' | 'audio' | 'embed'>('image');
  const [editScreen, setEditScreen] = useState<number>(0);
  const [editUrl, setEditUrl] = useState('');

  const handleUrlChange = (val: string) => {
    setNewUrl(val);
    // If the caption is currently empty, offer a smart inferred title
    if (!newCaption.trim() && val.trim().length > 8) {
      const inferred = inferCaptionFromUrl(val, newType);
      if (inferred) {
        setNewCaption(inferred);
      }
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const finalCaption = newCaption.trim() || inferCaptionFromUrl(newUrl.trim(), newType);

    const asset: MediaAsset = {
      id: 'media-' + Date.now(),
      url: newUrl.trim(),
      type: newType,
      caption: finalCaption,
      targetScreen: newScreen,
    };

    setMediaAssets([...mediaAssets, asset]);
    setNewUrl('');
    setNewCaption('');
    setNewScreen(0);
  };

  const handleStartEdit = (asset: MediaAsset) => {
    setEditingId(asset.id);
    setEditCaption(asset.caption);
    setEditType(asset.type);
    setEditScreen(asset.targetScreen);
    setEditUrl(asset.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editCaption.trim() && !editUrl.trim()) return;

    setMediaAssets(
      mediaAssets.map((asset) => {
        if (asset.id === id) {
          return {
            ...asset,
            caption: editCaption.trim() || asset.caption,
            type: editType,
            targetScreen: editScreen,
            url: editUrl.trim() || asset.url,
          };
        }
        return asset;
      })
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleRemoveAsset = (id: string) => {
    setMediaAssets(mediaAssets.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addPresetAsset = (preset: { url: string; type: 'video' | 'image'; caption: string; targetScreen?: number }) => {
    const asset: MediaAsset = {
      id: 'media-' + Date.now(),
      url: preset.url,
      type: preset.type,
      caption: preset.caption,
      targetScreen: preset.targetScreen || 0,
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
          Attach Cloudinary HTTPS videos, high-resolution infographics, and audio. All attached assets are guaranteed to be embedded into distinct screens of your generated SCORM package.
        </p>
      </div>

      {/* Cloudinary Best Practice Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-800/60 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-lg">
        <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            100% Asset Inclusion & Lightbox Zoom Guarantee
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Every video and infographic you attach will be given a dedicated screen in the lesson deck. All diagrams automatically inherit click-to-zoom <strong>Lightbox Modal</strong>, and videos include responsive HTML5 controls with zero package bloat.
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
                onChange={(e) => {
                  const t = e.target.value as any;
                  setNewType(t);
                  if (newUrl.trim() && !newCaption.trim()) {
                    setNewCaption(inferCaptionFromUrl(newUrl, t));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="image">Infographic / Diagram (Image)</option>
                <option value="video">MP4 Video (Cloudinary / CDN / MP4)</option>
                <option value="audio">MP3 Audio</option>
                <option value="embed">Interactive Web Embed</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Media URL or Path *</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
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
                <option value={0}>Auto-Distribute across Screens</option>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Figure Caption / Instructional Title</span>
                <span className="text-[11px] text-slate-500 font-normal">Editable anytime after adding</span>
              </label>
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder={newUrl ? inferCaptionFromUrl(newUrl, newType) : "e.g., Figure 2: Operational Flowchart"}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newUrl.trim()}
              className="w-full sm:w-auto mt-4 sm:mt-5 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add Asset to Deck
            </button>
          </div>
        </form>

        {/* Quick presets */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sample CDN Presets:</span>
          <button
            type="button"
            onClick={() => addPresetAsset({
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
              type: 'image',
              caption: 'Architecture Matrix & Process Flowchart',
              targetScreen: 3,
            })}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            + Sample Infographic Image
          </button>

          <button
            type="button"
            onClick={() => addPresetAsset({
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              type: 'video',
              caption: 'Video Briefing: Core Operations',
              targetScreen: 2,
            })}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            + Sample Video 1
          </button>

          <button
            type="button"
            onClick={() => addPresetAsset({
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              type: 'video',
              caption: 'Video Walkthrough: Tactical Execution',
              targetScreen: 4,
            })}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            + Sample Video 2
          </button>
        </div>
      </div>

      {/* Asset Table / List with Edit Support */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Configured Media Assets ({mediaAssets.length})
          </h2>
          <span className="text-xs text-slate-500">
            {mediaAssets.length === 0 
              ? 'No assets added yet (SVG illustrations will be generated)' 
              : 'All assets will be embedded into distinct screens'}
          </span>
        </div>

        {mediaAssets.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No media assets specified</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You can add multiple videos, diagrams, and infographics. The generator embeds every single item into its own screen in the course deck.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mediaAssets.map((asset, idx) => {
              const isEditing = editingId === asset.id;

              if (isEditing) {
                return (
                  <div
                    key={asset.id}
                    className="bg-slate-950 border-2 border-blue-500/80 rounded-xl p-4 shadow-xl space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Edit Media Asset #{idx + 1}
                        </span>
                      </div>
                      <button
                        onClick={handleCancelEdit}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                      <div className="md:col-span-3">
                        <label className="block text-slate-400 font-medium mb-1">Asset Type</label>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        >
                          <option value="image">Infographic / Diagram</option>
                          <option value="video">MP4 Video</option>
                          <option value="audio">MP3 Audio</option>
                          <option value="embed">Embed</option>
                        </select>
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-slate-400 font-medium mb-1">Caption / Title</label>
                        <input
                          type="text"
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                          placeholder="Figure title..."
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-slate-400 font-medium mb-1">Target Placement</label>
                        <select
                          value={editScreen}
                          onChange={(e) => setEditScreen(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        >
                          <option value={0}>Auto-Distribute</option>
                          {Array.from({ length: Math.max(6, totalScreens) }, (_, i) => i + 1).map((s) => (
                            <option key={s} value={s}>
                              Screen {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-slate-400 font-medium mb-1">Media URL</label>
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(asset.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
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
                        <span 
                          onClick={() => handleStartEdit(asset)}
                          className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md hover:text-blue-400 cursor-pointer"
                          title="Click to edit caption"
                        >
                          {asset.caption}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {asset.type}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {asset.targetScreen === 0 ? `Auto-Placed (Screen ~${Math.min(6, idx + 2)})` : `Screen ${asset.targetScreen}`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-lg mt-0.5 font-mono text-[11px]">
                        {asset.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartEdit(asset)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      title="Edit caption and placement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Open asset preview in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleRemoveAsset(asset.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
