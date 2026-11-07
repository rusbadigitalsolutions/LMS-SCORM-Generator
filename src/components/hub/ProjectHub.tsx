import React from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Plus, 
  Play, 
  Download, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Trash2,
  ExternalLink,
  Layers,
  Upload
} from 'lucide-react';
import { ScormProject } from '../../types/scorm';
import { SAMPLE_COURSES, SampleCourseTemplate } from '../../data/sampleCourses';

interface ProjectHubProps {
  projects: ScormProject[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewLesson: () => void;
  onLoadTemplate: (template: SampleCourseTemplate) => void;
  onDeleteProject: (id: string) => void;
  onExportZip: (project: ScormProject) => void;
  onOpenPlayer: (project: ScormProject) => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onNewLesson,
  onLoadTemplate,
  onDeleteProject,
  onExportZip,
  onOpenPlayer,
}) => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered SCORM 1.2 & 2004 Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            LMS SCORM Generator
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Convert curriculum text and Cloudinary assets into interactive, self-contained SCORM packages with embedded runtime JavaScript, cognitive gamification, and responsive image lightbox modals.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNewLesson}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Starter Templates */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Pre-built Curriculum Blueprints
            </h2>
            <p className="text-xs text-slate-400">
              Launch high-fidelity courses ready for instant preview and packaging.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_COURSES.map((sample) => (
            <div
              key={sample.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {sample.category}
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                  {sample.lessonTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {sample.courseTitle}
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Fixed 6 Screens &bull; Simulator</span>
                <button
                  onClick={() => onLoadTemplate(sample)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold transition-all"
                >
                  Load Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Lessons / Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              Active Workspace Lessons ({projects.length})
            </h2>
            <p className="text-xs text-slate-400">
              All lessons are stored in local workspace memory with standard manifest and SCORM runtime.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No active lessons in workspace</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              Get started by creating a new lesson from scratch or loading a pre-built executive template above.
            </p>
            <button
              onClick={onNewLesson}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Start New Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = proj.id === currentProjectId;
              return (
                <div
                  key={proj.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FolderGit2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">
                          {proj.lessonTitle}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          SCORM {proj.settings.scormVersion}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {proj.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="truncate max-w-xs">{proj.courseTitle}</span>
                        <span>&bull;</span>
                        <span>{proj.settings.targetScreens} Screens</span>
                        <span>&bull;</span>
                        <span className="text-slate-500">
                          {new Date(proj.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onOpenPlayer(proj)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all hover:scale-105"
                      title="Open in Sandboxed SCORM Player"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play & Inspect</span>
                    </button>

                    <button
                      onClick={() => onExportZip(proj)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition-colors"
                      title="Export .ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ZIP</span>
                    </button>

                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
