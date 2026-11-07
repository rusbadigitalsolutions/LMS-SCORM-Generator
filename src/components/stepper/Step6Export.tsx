import React, { useState } from 'react';
import { 
  PackageCheck, 
  Download, 
  FileCode, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  FolderArchive
} from 'lucide-react';
import { ScormPackageFiles, ScormProject } from '../../types/scorm';
import { createScormZipBlob, triggerBlobDownload, triggerTextDownload } from '../../utils/zipExporter';

interface Step6ExportProps {
  project: ScormProject;
  files: ScormPackageFiles;
  onPrev: () => void;
  onOpenGuide: () => void;
}

export const Step6Export: React.FC<Step6ExportProps> = ({
  project,
  files,
  onPrev,
  onOpenGuide,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const zipFilename = `${project.courseSlug || 'lms_course'}_${project.lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scorm.zip`;

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await createScormZipBlob(files);
      triggerBlobDownload(blob, zipFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <PackageCheck className="w-3.5 h-3.5" />
          Step 6: Export & LMS Packaging
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Package SCORM Standard Course Archive
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your e-learning lesson is verified and ready for direct deployment to any SCORM-compliant Learning Management System.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 shrink-0">
              <FolderArchive className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{zipFilename}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Import
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Standard ADL SCORM {project.settings.scormVersion} Archive &bull; Root Manifest Structure &bull; Universal Telemetry
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                <span>imsmanifest.xml (root)</span>
                <span>index.html (root)</span>
                <span>js/scormAPI.js</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>{isZipping ? 'Compiling Archive...' : 'Download SCORM ZIP Package'}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="mt-6 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Downloaded <strong>{zipFilename}</strong> successfully. Upload this file directly into your LMS.</span>
          </div>
        )}
      </div>

      {/* Individual File Downloads & Direct Inspection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          Individual File Downloads & Source Context
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>imsmanifest.xml</span>
                <span className="text-[10px] text-slate-500 font-mono">ADL XML</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Root LMS course registration schema.</p>
            </div>
            <button
              onClick={() => triggerTextDownload(files['imsmanifest.xml'], 'imsmanifest.xml', 'application/xml')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download XML
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>index.html</span>
                <span className="text-[10px] text-slate-500 font-mono">HTML5 Deck</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">No-scroll deck layout with gamification.</p>
            </div>
            <button
              onClick={() => triggerTextDownload(files['index.html'], 'index.html', 'text/html')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>scormAPI.js</span>
                <span className="text-[10px] text-slate-500 font-mono">Universal JS</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">SCORM 1.2 & 2004 dual adapter.</p>
            </div>
            <button
              onClick={() => triggerTextDownload(files['js/scormAPI.js'], 'scormAPI.js', 'application/javascript')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download JS
            </button>
          </div>
        </div>
      </div>

      {/* LMS Platform Compatibility & Upload Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            LMS Compatibility & Fast Deployment Guides
          </h3>

          <button
            onClick={onOpenGuide}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <span>View Full LMS Walkthroughs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: 'Moodle', tip: 'Add activity -> SCORM package -> Upload ZIP' },
            { name: 'Canvas LMS', tip: 'SCORM tool -> Upload package -> Import as Assignment' },
            { name: 'Blackboard', tip: 'Content -> Content Market -> SCORM package' },
            { name: 'TalentLMS', tip: 'Add content -> SCORM / xAPI / cmi5' },
            { name: 'SCORM Cloud', tip: 'Free testing sandbox (Rustici Software)' },
          ].map((lms) => (
            <div key={lms.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-xs text-white block">{lms.name}</span>
              <span className="text-[11px] text-slate-400 block mt-1 leading-snug">{lms.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Player & Code
        </button>

        <button
          onClick={handleDownloadZip}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          Download Package Again
        </button>
      </div>
    </div>
  );
};
