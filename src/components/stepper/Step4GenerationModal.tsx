import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  FileCode, 
  ShieldCheck, 
  Boxes, 
  AlertCircle 
} from 'lucide-react';

export interface GenerationStage {
  id: number;
  label: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface Step4GenerationModalProps {
  stages: GenerationStage[];
  errorNotice: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

export const Step4GenerationModal: React.FC<Step4GenerationModalProps> = ({
  stages,
  errorNotice,
  onRetry,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full blur-sm" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">SCORM Studio AI Engine</h3>
            <p className="text-xs text-slate-400">Synthesizing interactive e-learning package</p>
          </div>
        </div>

        {errorNotice ? (
          <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block">Generation Issue Detected</strong>
                <p className="text-xs text-red-300 mt-1">{errorNotice}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Retry Generation
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {stages.map((stage) => {
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    stage.status === 'running'
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-300 shadow-sm'
                      : stage.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                    {stage.status === 'running' ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : stage.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>{stage.label}</span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {stage.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {stage.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
          <span>Engine: Google Gemini 3.8 Flash</span>
          <span>Zero-Citation Rule Active</span>
        </div>
      </div>
    </div>
  );
};
