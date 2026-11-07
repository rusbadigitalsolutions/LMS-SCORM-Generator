import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Hash, 
  Clock, 
  Layers, 
  CheckCircle,
  FileCode,
  Copy,
  Cloud,
  Loader2,
  Database,
  ExternalLink,
  Settings,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_COURSES, SampleCourseTemplate } from '../../data/sampleCourses';
import { CloudAccountSettings } from '../../types/cloud';

interface Step1ContentProps {
  courseTitle: string;
  setCourseTitle: (val: string) => void;
  moduleBadge: string;
  setModuleBadge: (val: string) => void;
  lessonTitle: string;
  setLessonTitle: (val: string) => void;
  lessonContent: string;
  setLessonContent: (val: string) => void;
  onNext: () => void;
  onLoadTemplate: (template: SampleCourseTemplate) => void;
  cloudSettings?: CloudAccountSettings;
  onOpenCloudSettings?: () => void;
}

export const Step1Content: React.FC<Step1ContentProps> = ({
  courseTitle,
  setCourseTitle,
  moduleBadge,
  setModuleBadge,
  lessonTitle,
  setLessonTitle,
  lessonContent,
  setLessonContent,
  onNext,
  onLoadTemplate,
  cloudSettings,
  onOpenCloudSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'upload' | 'cloud' | 'samples'>('editor');
  const [dragOver, setDragOver] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Cloud Import State
  const [cloudUrl, setCloudUrl] = useState('');
  const [cloudProvider, setCloudProvider] = useState<'auto' | 'google_docs' | 'dropbox' | 'custom_url'>('auto');
  const [isFetchingCloud, setIsFetchingCloud] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Statistics
  const wordCount = lessonContent.trim() ? lessonContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));
  const suggestedScreens = Math.min(8, Math.max(4, Math.ceil(wordCount / 160)));

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setLessonContent(text);
        if (!lessonTitle) {
          const firstLine = text.split('\n')[0].replace(/^#+\s*/, '').trim();
          if (firstLine) setLessonTitle(firstLine);
        }
        setUploadNotice(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFetchCloudDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudUrl.trim()) return;

    setIsFetchingCloud(true);
    setCloudError(null);

    try {
      const response = await fetch('/api/cloud/fetch-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cloudUrl.trim(),
          provider: cloudProvider,
          accessToken: cloudSettings?.google?.accessToken || cloudSettings?.dropbox?.accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cloud document.');
      }

      setLessonContent(data.content);
      if (data.title && (!lessonTitle || lessonTitle.trim() === '')) {
        setLessonTitle(data.title);
      }
      setUploadNotice(`Imported from ${data.provider.replace('_', ' ')}: "${data.title}" (${data.wordCount} words)`);
      setActiveTab('editor');
    } catch (err: any) {
      console.error('Cloud fetch failed:', err);
      setCloudError(err.message || 'Error connecting to cloud provider.');
    } finally {
      setIsFetchingCloud(false);
    }
  };

  const isValid = courseTitle.trim().length > 0 && lessonTitle.trim().length > 0 && lessonContent.trim().length > 50;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Description */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            Step 1: Curriculum Ingestion
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ingest Curriculum & Lesson Structure
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Import notes from Google Docs, Google Drive, Dropbox, local markdown files, or direct text.
          </p>
        </div>

        {onOpenCloudSettings && (
          <button
            onClick={onOpenCloudSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md self-start sm:self-center"
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>Cloud Accounts & Keys</span>
          </button>
        )}
      </div>

      {/* Course Metadata Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Course & Lesson Metadata
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g., Enterprise Cloud Security & Defense"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Module Badge / Track
            </label>
            <input
              type="text"
              value={moduleBadge}
              onChange={(e) => setModuleBadge(e.target.value)}
              placeholder="e.g., Module 3 • Zero Trust Architecture"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lesson Title *
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g., Micro-Segmentation & Identity Guardrails"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs for Ingestion Mode */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'editor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Direct Text / Markdown
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'cloud'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cloud className="w-4 h-4 text-cyan-400" />
          Google Drive / Docs & Dropbox
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          Local File Import (.md, .txt)
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'samples'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Pre-built Samples
        </button>
      </div>

      {/* Tab 1: Direct Editor */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {uploadNotice && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {uploadNotice}
              </span>
              <button onClick={() => setUploadNotice(null)} className="text-emerald-400 hover:text-white font-bold">&times;</button>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lesson Content & Instructional Copy
              </span>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{wordCount}</strong> words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  ~{readingTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Suggested: {suggestedScreens} screens
                </span>
              </div>
            </div>

            <textarea
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              rows={14}
              placeholder="Paste your curriculum text, executive summary, policy document, or markdown content here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Cloud Connectors (Google Docs, Google Drive, Dropbox, Custom URL) */}
      {activeTab === 'cloud' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                Import from Google Docs, Drive, or Dropbox
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Paste any shared Google Document link or Dropbox file URL. The app extracts text and maps it into SCORM screens.
              </p>
            </div>

            {onOpenCloudSettings && (
              <button
                type="button"
                onClick={onOpenCloudSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Account Credentials</span>
              </button>
            )}
          </div>

          {cloudError && (
            <div className="bg-red-950/60 border border-red-800 text-red-200 text-xs p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Import Failed</strong>
                <p className="mt-0.5 text-red-300 leading-relaxed">{cloudError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFetchCloudDoc} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cloud Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'google_docs', label: 'Google Docs', icon: FileText },
                  { id: 'google_drive', label: 'Google Drive', icon: Cloud },
                  { id: 'dropbox', label: 'Dropbox', icon: Database },
                  { id: 'custom_url', label: 'Raw S3 / GitHub', icon: ExternalLink },
                ].map((prov) => {
                  const Icon = prov.icon;
                  const isSel = cloudProvider === prov.id || (cloudProvider === 'auto' && prov.id === 'google_docs');
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setCloudProvider(prov.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-400" />
                      <span>{prov.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Document URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={cloudUrl}
                  onChange={(e) => {
                    setCloudUrl(e.target.value);
                    if (cloudError) setCloudError(null);
                  }}
                  placeholder="https://docs.google.com/document/d/... or https://www.dropbox.com/s/..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={isFetchingCloud || !cloudUrl.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 shrink-0"
                >
                  {isFetchingCloud ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching Doc...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Fetch & Ingest</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Supports any Google Doc link with "Anyone with the link can view", Dropbox shared links, or files authenticated via your personal access token.
              </p>
            </div>
          </form>

          {/* Quick Demo Links */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-medium block mb-2">Try with public sample doc links:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCloudUrl('https://raw.githubusercontent.com/github/gitignore/main/README.md');
                  setCloudProvider('custom_url');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Sample Cloud Markdown Spec (GitHub / S3)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Upload File */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Drag and Drop your Lesson Document here
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Supports Markdown (.md), Plain Text (.txt), Word (.docx), and PDF text extracts.
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm cursor-pointer shadow-lg shadow-blue-600/30 transition-all hover:scale-105">
            <Upload className="w-4 h-4" />
            Browse Local File
            <input
              type="file"
              accept=".txt,.md,.markdown,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Tab 3: Pre-built Samples */}
      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_COURSES.map((sample) => (
            <div
              key={sample.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {sample.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-3 group-hover:text-blue-400 transition-colors">
                  {sample.lessonTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {sample.courseTitle}
                </p>
                <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    onLoadTemplate(sample);
                    setActiveTab('editor');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Load This Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {isValid ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4" /> Ready for media assets
            </span>
          ) : (
            <span>Please provide course title, lesson title, and at least 50 characters of copy.</span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
        >
          <span>Continue to Media Manager</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
