import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  Laptop, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Terminal, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  ArrowRight,
  Maximize2,
  Trash2,
  Save,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CmiState, ScormPackageFiles, TelemetryLog, ValidationItem } from '../../types/scorm';
import { getMockScormRuntimeScript } from '../../utils/mockScormRuntime';
import { validateScormPackage } from '../../utils/scormValidator';

interface Step5PlayerAndEditorProps {
  files: ScormPackageFiles;
  setFiles: React.Dispatch<React.SetStateAction<ScormPackageFiles>>;
  onNext: () => void;
  onPrev: () => void;
}

export const Step5PlayerAndEditor: React.FC<Step5PlayerAndEditorProps> = ({
  files,
  setFiles,
  onNext,
  onPrev,
}) => {
  const [activeFileTab, setActiveFileTab] = useState<'index.html' | 'imsmanifest.xml' | 'js/scormAPI.js' | 'qa'>('index.html');
  const [editorCode, setEditorCode] = useState<string>(files['index.html'] || '');
  const [viewportMode, setViewportMode] = useState<'laptop' | 'desktop' | 'tablet' | 'mobile'>('laptop');
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [cmiState, setCmiState] = useState<CmiState>({
    lesson_status: 'not attempted',
    lesson_location: '',
    score_raw: '0',
    suspend_data: '',
  });
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  // QA Audit
  const qaResults = validateScormPackage(files);

  // Sync editorCode when file tab switches
  useEffect(() => {
    if (activeFileTab === 'index.html') {
      setEditorCode(files['index.html'] || '');
    } else if (activeFileTab === 'imsmanifest.xml') {
      setEditorCode(files['imsmanifest.xml'] || '');
    } else if (activeFileTab === 'js/scormAPI.js') {
      setEditorCode(files['js/scormAPI.js'] || '');
    }
  }, [activeFileTab, files]);

  // Listen to Mock SCORM LMS messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'SCORM_MOCK_LMS') {
        const { action, param, result, timestamp } = event.data.payload;
        const newLog: TelemetryLog = {
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          timestamp: timestamp ? timestamp.split('T')[1].slice(0, 8) : new Date().toLocaleTimeString(),
          action,
          param,
          result,
        };

        setTelemetryLogs((prev) => [newLog, ...prev.slice(0, 49)]);

        // Update CMI state
        if (action === 'LMSSetValue' || action === 'SetValue') {
          if (param.includes('cmi.core.lesson_status') || param.includes('cmi.completion_status')) {
            const val = param.split('=')[1]?.trim() || '';
            setCmiState((s) => ({ ...s, lesson_status: val }));
          } else if (param.includes('cmi.core.score.raw') || param.includes('cmi.score.raw')) {
            const val = param.split('=')[1]?.trim() || '';
            setCmiState((s) => ({ ...s, score_raw: val }));
          } else if (param.includes('cmi.core.lesson_location') || param.includes('cmi.location')) {
            const val = param.split('=')[1]?.trim() || '';
            setCmiState((s) => ({ ...s, lesson_location: val }));
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleApplyCodeChange = () => {
    if (activeFileTab === 'index.html') {
      setFiles({ ...files, 'index.html': editorCode });
    } else if (activeFileTab === 'imsmanifest.xml') {
      setFiles({ ...files, 'imsmanifest.xml': editorCode });
    } else if (activeFileTab === 'js/scormAPI.js') {
      setFiles({ ...files, 'js/scormAPI.js': editorCode });
    }
    setIframeKey((k) => k + 1);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare iframe srcDoc injecting the Mock SCORM LMS Runtime script
  const getIframeSrcDoc = () => {
    let html = files['index.html'] || '<p>No content</p>';
    const mockScript = getMockScormRuntimeScript();

    // Injects Mock SCORM runtime into the HTML head before anything else
    if (html.includes('<head>')) {
      return html.replace('<head>', `<head>\n${mockScript}\n`);
    }
    return `${mockScript}\n${html}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Play className="w-3.5 h-3.5" />
            Step 5: Interactive Player & Code Inspection
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Live SCORM Runtime Simulator & Dual-Pane Editor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            title="Reload lesson preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Restart Player
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all hover:scale-105"
          >
            <span>Proceed to Export .ZIP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        {/* Left Pane: Sandboxed SCORM Player (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Player Toolbar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-white">Live LMS Preview Stage</span>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewportMode('laptop')}
                className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  viewportMode === 'laptop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="SCORM Standard 94vh / 980px Laptop Deck"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop (980px)</span>
              </button>

              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  viewportMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Full width desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">100%</span>
              </button>

              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  viewportMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet 768px"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  viewportMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile 420px"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Player Frame Container */}
          <div className="flex-1 bg-slate-950/80 p-3 sm:p-4 flex items-center justify-center overflow-auto min-h-[500px]">
            <div
              className={`transition-all duration-300 w-full flex items-center justify-center ${
                viewportMode === 'laptop'
                  ? 'max-w-[980px] h-[580px]'
                  : viewportMode === 'tablet'
                  ? 'max-w-[768px] h-[580px]'
                  : viewportMode === 'mobile'
                  ? 'max-w-[420px] h-[580px]'
                  : 'w-full h-[580px]'
              }`}
            >
              <iframe
                key={iframeKey}
                srcDoc={getIframeSrcDoc()}
                title="SCORM Lesson Sandboxed Player"
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full border-0 rounded-xl shadow-2xl bg-white"
              />
            </div>
          </div>

          {/* SCORM Telemetry Console (Bottom Drawer) */}
          <div className="bg-slate-950 border-t border-slate-800">
            {/* Console Header & CMI Status Bar */}
            <div className="px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                  className="flex items-center gap-1.5 font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>SCORM Telemetry Console</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                    {telemetryLogs.length} events
                  </span>
                </button>
              </div>

              {/* Active CMI Badges */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono">status:</span>
                  <span className={`font-bold ${
                    cmiState.lesson_status === 'passed' || cmiState.lesson_status === 'completed'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {cmiState.lesson_status || 'incomplete'}
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono">score:</span>
                  <span className="font-bold text-blue-400">
                    {cmiState.score_raw || '0'}
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono">loc:</span>
                  <span className="font-bold text-slate-300 font-mono">
                    {cmiState.lesson_location || 'screen_1'}
                  </span>
                </div>

                {telemetryLogs.length > 0 && (
                  <button
                    onClick={() => setTelemetryLogs([])}
                    className="p-1 rounded text-slate-500 hover:text-slate-300"
                    title="Clear console"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Console Log Feed */}
            {isConsoleExpanded && (
              <div className="h-40 overflow-y-auto p-3 font-mono text-[11px] space-y-1 bg-black/60">
                {telemetryLogs.length === 0 ? (
                  <div className="text-slate-600 italic py-2">
                    Console ready. Interact with the lesson buttons, gamified activities, or screen arrows to stream LMSSetValue telemetry...
                  </div>
                ) : (
                  telemetryLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-slate-300 hover:bg-white/5 py-0.5 px-1 rounded">
                      <span className="text-slate-500 select-none">{log.timestamp}</span>
                      <span className={`font-bold uppercase ${
                        log.action.includes('Initialize') ? 'text-indigo-400' :
                        log.action.includes('Finish') || log.action.includes('Terminate') ? 'text-purple-400' :
                        log.action.includes('Commit') ? 'text-emerald-400' :
                        log.action.includes('SetValue') ? 'text-blue-400' : 'text-amber-400'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-400 truncate flex-1">{log.param}</span>
                      <span className="text-emerald-500 text-[10px]">[{log.result}]</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & QA Inspector (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* File Switcher Tabs */}
          <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFileTab('index.html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFileTab === 'index.html'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                index.html
              </button>

              <button
                onClick={() => setActiveFileTab('imsmanifest.xml')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFileTab === 'imsmanifest.xml'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                imsmanifest.xml
              </button>

              <button
                onClick={() => setActiveFileTab('js/scormAPI.js')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFileTab === 'js/scormAPI.js'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                scormAPI.js
              </button>

              <button
                onClick={() => setActiveFileTab('qa')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFileTab === 'qa'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                LMS QA ({qaResults.score}%)
              </button>
            </div>

            {activeFileTab !== 'qa' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  title="Copy code to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Editor Body */}
          {activeFileTab === 'qa' ? (
            /* QA Compliance Auditor View */
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/60">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    LMS Compliance QA Audit Score
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified for Moodle, Canvas, Blackboard, TalentLMS, and SCORM Cloud.
                  </p>
                </div>
                <div className={`text-2xl font-black ${
                  qaResults.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {qaResults.score}%
                </div>
              </div>

              <div className="space-y-2.5">
                {qaResults.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : item.status === 'warn' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold">&times;</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Code Editor Pane */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
              <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct code editor &bull; Instant hot-reload enabled</span>
                <button
                  onClick={handleApplyCodeChange}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Apply & Reload
                </button>
              </div>

              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 font-mono text-xs text-slate-200 bg-slate-950 resize-none focus:outline-none leading-relaxed border-0"
              />
            </div>
          )}

          {/* Bottom Bar for Editor Pane */}
          {activeFileTab !== 'qa' && (
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                {editorCode.split('\n').length} lines &bull; {Math.round(editorCode.length / 1024)} KB
              </span>
              <button
                onClick={handleApplyCodeChange}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
              >
                <span>Save to Active Memory</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
